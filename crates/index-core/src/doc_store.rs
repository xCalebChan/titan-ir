use std::fs::{File, OpenOptions};
use std::io::{self, BufWriter, Write};
use std::path::Path;
use memmap2::Mmap;

use crate::types::{DocId, DocRecord};

/// Manages append-only binary flat storage of documents and a fixed-width offset table (DocID * 8 bytes)
/// mapped via mmap for instant O(1) random access without keeping strings in RAM.
pub struct DocStoreWriter {
    data_file: BufWriter<File>,
    offsets_file: BufWriter<File>,
    current_offset: u64,
    next_doc_id: DocId,
}

impl DocStoreWriter {
    pub fn create(data_path: impl AsRef<Path>, offsets_path: impl AsRef<Path>) -> io::Result<Self> {
        let data_file = BufWriter::new(
            OpenOptions::new()
                .create(true)
                .write(true)
                .truncate(true)
                .open(data_path)?,
        );
        let offsets_file = BufWriter::new(
            OpenOptions::new()
                .create(true)
                .write(true)
                .truncate(true)
                .open(offsets_path)?,
        );

        Ok(Self {
            data_file,
            offsets_file,
            current_offset: 0,
            next_doc_id: 0,
        })
    }

    /// Appends a document record to the flat file and records its 8-byte offset in the offset table.
    pub fn append(&mut self, record: &DocRecord) -> io::Result<DocId> {
        let doc_id = self.next_doc_id;
        let payload = serde_json::to_vec(record)
            .map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?;

        let payload_len = payload.len() as u32;

        // Write offset table entry (8 bytes, little-endian)
        self.offsets_file.write_all(&self.current_offset.to_le_bytes())?;

        // Write record to data file: [length: u32][payload bytes]
        self.data_file.write_all(&payload_len.to_le_bytes())?;
        self.data_file.write_all(&payload)?;

        self.current_offset += 4 + payload.len() as u64;
        self.next_doc_id += 1;

        Ok(doc_id)
    }

    /// Flushes both files.
    pub fn flush(&mut self) -> io::Result<()> {
        self.offsets_file.flush()?;
        self.data_file.flush()?;
        Ok(())
    }

    pub fn len(&self) -> usize {
        self.next_doc_id as usize
    }

    pub fn is_empty(&self) -> bool {
        self.next_doc_id == 0
    }
}

/// Memory-mapped document reader for sub-microsecond random access by DocID.
pub struct DocStoreReader {
    _data_file: File,
    _offsets_file: File,
    data_mmap: Mmap,
    offsets_mmap: Mmap,
    num_docs: usize,
}

impl DocStoreReader {
    pub fn open(data_path: impl AsRef<Path>, offsets_path: impl AsRef<Path>) -> io::Result<Self> {
        let data_file = File::open(data_path)?;
        let offsets_file = File::open(offsets_path)?;

        let data_mmap = unsafe { Mmap::map(&data_file)? };
        let offsets_mmap = unsafe { Mmap::map(&offsets_file)? };

        let num_docs = offsets_mmap.len() / 8;

        Ok(Self {
            _data_file: data_file,
            _offsets_file: offsets_file,
            data_mmap,
            offsets_mmap,
            num_docs,
        })
    }

    /// Returns the total number of documents indexed.
    pub fn len(&self) -> usize {
        self.num_docs
    }

    pub fn is_empty(&self) -> bool {
        self.num_docs == 0
    }

    /// Fetches a document by DocID with zero heap allocations for offset lookup.
    pub fn get(&self, doc_id: DocId) -> Option<DocRecord> {
        let id_usize = doc_id as usize;
        if id_usize >= self.num_docs {
            return None;
        }

        let offset_pos = id_usize * 8;
        let offset_bytes: [u8; 8] = self.offsets_mmap[offset_pos..offset_pos + 8]
            .try_into()
            .ok()?;
        let offset = u64::from_le_bytes(offset_bytes) as usize;

        if offset + 4 > self.data_mmap.len() {
            return None;
        }

        let len_bytes: [u8; 4] = self.data_mmap[offset..offset + 4].try_into().ok()?;
        let payload_len = u32::from_le_bytes(len_bytes) as usize;

        let payload_start = offset + 4;
        let payload_end = payload_start + payload_len;

        if payload_end > self.data_mmap.len() {
            return None;
        }

        let payload_slice = &self.data_mmap[payload_start..payload_end];
        serde_json::from_slice(payload_slice).ok()
    }
}

/// In-memory document storage useful for quick unit testing and lightweight serving.
#[derive(Clone, Default, Debug)]
pub struct InMemoryDocStore {
    docs: Vec<DocRecord>,
}

impl InMemoryDocStore {
    pub fn new() -> Self {
        Self { docs: Vec::new() }
    }

    pub fn append(&mut self, record: DocRecord) -> DocId {
        let id = self.docs.len() as DocId;
        self.docs.push(record);
        id
    }

    pub fn get(&self, doc_id: DocId) -> Option<&DocRecord> {
        self.docs.get(doc_id as usize)
    }

    pub fn len(&self) -> usize {
        self.docs.len()
    }

    pub fn is_empty(&self) -> bool {
        self.docs.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_doc_store_append_and_mmap_read() {
        let temp_dir = std::env::temp_dir().join(format!("titan_test_{}", rand_id()));
        std::fs::create_dir_all(&temp_dir).unwrap();

        let data_path = temp_dir.join("corpus_data.bin");
        let offsets_path = temp_dir.join("offsets.bin");

        {
            let mut writer = DocStoreWriter::create(&data_path, &offsets_path).unwrap();
            let d0 = DocRecord::new(0, "Title 0", "First document body content", Some("https://example.com/0".into()));
            let d1 = DocRecord::new(1, "Title 1", "Second passage with MS MARCO content", None);
            let d2 = DocRecord::new(2, "Title 2", "Third vector and lexical test passage", Some("https://example.com/2".into()));

            assert_eq!(writer.append(&d0).unwrap(), 0);
            assert_eq!(writer.append(&d1).unwrap(), 1);
            assert_eq!(writer.append(&d2).unwrap(), 2);
            writer.flush().unwrap();
        }

        {
            let reader = DocStoreReader::open(&data_path, &offsets_path).unwrap();
            assert_eq!(reader.len(), 3);

            let doc1 = reader.get(1).unwrap();
            assert_eq!(doc1.title, "Title 1");
            assert_eq!(doc1.body, "Second passage with MS MARCO content");
            assert_eq!(doc1.url, None);

            let doc2 = reader.get(2).unwrap();
            assert_eq!(doc2.title, "Title 2");

            assert!(reader.get(3).is_none());
        }

        let _ = std::fs::remove_dir_all(&temp_dir);
    }

    fn rand_id() -> u64 {
        use std::time::{SystemTime, UNIX_EPOCH};
        SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_nanos() as u64
    }
}
