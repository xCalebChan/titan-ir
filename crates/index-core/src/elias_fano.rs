use std::error::Error;
use std::fmt;

/// A compressed representation of a strictly increasing sequence of `u32`s.
///
/// The sequence is represented using Elias-Fano low-bit packing and unary
/// high-bit positions. Values are reconstructed without retaining the input.
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EliasFano {
    len: usize,
    low_bits: u8,
    lower: Vec<u64>,
    upper: Vec<u64>,
}

/// Errors returned when constructing an [`EliasFano`] sequence.
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum EliasFanoError {
    /// The input contains a duplicate or decreasing value at this position.
    NotStrictlyIncreasing { index: usize },
    /// The encoded upper bit vector cannot be represented on this platform.
    LengthOverflow,
}

impl fmt::Display for EliasFanoError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::NotStrictlyIncreasing { index } => {
                write!(formatter, "values are not strictly increasing at index {index}")
            }
            Self::LengthOverflow => formatter.write_str("Elias-Fano bit-vector length overflow"),
        }
    }
}

impl Error for EliasFanoError {}

impl EliasFano {
    /// Encodes sorted values, rejecting duplicates and descending input.
    pub fn from_sorted(values: &[u32]) -> Result<Self, EliasFanoError> {
        for (index, pair) in values.windows(2).enumerate() {
            if pair[0] >= pair[1] {
                return Err(EliasFanoError::NotStrictlyIncreasing { index: index + 1 });
            }
        }

        if values.is_empty() {
            return Ok(Self {
                len: 0,
                low_bits: 0,
                lower: Vec::new(),
                upper: Vec::new(),
            });
        }

        let len = values.len();
        let universe = u64::from(*values.last().expect("non-empty values")) + 1;
        let ratio = universe / len as u64;
        let low_bits = if ratio == 0 {
            0
        } else {
            (u64::BITS - 1 - ratio.leading_zeros()) as u8
        };

        let lower_bit_len = len
            .checked_mul(usize::from(low_bits))
            .ok_or(EliasFanoError::LengthOverflow)?;
        let lower_word_len = words_for_bits(lower_bit_len)?;

        let upper_bit_len_u64 = (u64::from(*values.last().expect("non-empty values"))
            >> low_bits)
            .checked_add(len as u64)
            .ok_or(EliasFanoError::LengthOverflow)?;
        let upper_bit_len =
            usize::try_from(upper_bit_len_u64).map_err(|_| EliasFanoError::LengthOverflow)?;
        let upper_word_len = words_for_bits(upper_bit_len)?;

        let mut lower = vec![0; lower_word_len];
        let mut upper = vec![0; upper_word_len];
        for (index, &value) in values.iter().enumerate() {
            let value = u64::from(value);
            write_bits(
                &mut lower,
                index * usize::from(low_bits),
                low_bits,
                value & mask(low_bits),
            );

            let high = value >> low_bits;
            let position = usize::try_from(high)
                .ok()
                .and_then(|high| high.checked_add(index))
                .ok_or(EliasFanoError::LengthOverflow)?;
            upper[position / 64] |= 1_u64 << (position % 64);
        }

        Ok(Self {
            len,
            low_bits,
            lower,
            upper,
        })
    }

    /// Returns the number of encoded values.
    pub fn len(&self) -> usize {
        self.len
    }

    /// Returns whether this sequence is empty.
    pub fn is_empty(&self) -> bool {
        self.len == 0
    }

    /// Returns the value at `index`, or `None` when it is out of bounds.
    pub fn get(&self, index: usize) -> Option<u32> {
        if index >= self.len {
            return None;
        }

        let position = self.select_one(index)?;
        let high = position.checked_sub(index)?;
        let low = read_bits(
            &self.lower,
            index * usize::from(self.low_bits),
            self.low_bits,
        );
        let value = (u64::try_from(high).ok()? << self.low_bits) | low;
        u32::try_from(value).ok()
    }

    /// Finds the first (index, value) pair where value >= target, searching starting from `from_index`.
    /// Uses binary search over the monotonic sequence in O(log N).
    pub fn next_geq(&self, target: u32, from_index: usize) -> Option<(usize, u32)> {
        if from_index >= self.len {
            return None;
        }
        let last = self.get(self.len - 1)?;
        if last < target {
            return None;
        }
        let first = self.get(from_index)?;
        if first >= target {
            return Some((from_index, first));
        }

        let mut low = from_index;
        let mut high = self.len - 1;
        let mut best = None;

        while low <= high {
            let mid = low + (high - low) / 2;
            let val = self.get(mid)?;
            if val >= target {
                best = Some((mid, val));
                if mid == 0 {
                    break;
                }
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        best
    }

    /// Returns an iterator over the decoded values.
    pub fn iter(&self) -> EliasFanoIter<'_> {
        EliasFanoIter {
            encoded: self,
            index: 0,
            upper_word_index: 0,
            remaining_upper_word: self.upper.first().copied().unwrap_or(0),
        }
    }

    /// Returns the allocated payload size, excluding vector headers and capacity.
    pub fn encoded_bytes(&self) -> usize {
        (self.lower.len() + self.upper.len()) * std::mem::size_of::<u64>()
    }

    fn select_one(&self, target: usize) -> Option<usize> {
        let mut remaining = target;
        for (word_index, &word) in self.upper.iter().enumerate() {
            let count = word.count_ones() as usize;
            if remaining < count {
                let mut candidates = word;
                for _ in 0..remaining {
                    candidates &= candidates - 1;
                }
                let bit = candidates.trailing_zeros() as usize;
                return word_index.checked_mul(64)?.checked_add(bit);
            }
            remaining -= count;
        }
        None
    }
}

/// Sequential decoder for an [`EliasFano`] sequence.
pub struct EliasFanoIter<'a> {
    encoded: &'a EliasFano,
    index: usize,
    upper_word_index: usize,
    remaining_upper_word: u64,
}

impl Iterator for EliasFanoIter<'_> {
    type Item = u32;

    fn next(&mut self) -> Option<Self::Item> {
        if self.index == self.encoded.len {
            return None;
        }

        while self.remaining_upper_word == 0 {
            self.upper_word_index += 1;
            self.remaining_upper_word = *self.encoded.upper.get(self.upper_word_index)?;
        }

        let bit = self.remaining_upper_word.trailing_zeros() as usize;
        self.remaining_upper_word &= self.remaining_upper_word - 1;
        let position = self.upper_word_index * 64 + bit;
        let high = position - self.index;
        let low = read_bits(
            &self.encoded.lower,
            self.index * usize::from(self.encoded.low_bits),
            self.encoded.low_bits,
        );
        let value = (u64::try_from(high).expect("encoded high bits fit in u64")
            << self.encoded.low_bits)
            | low;
        self.index += 1;
        Some(u32::try_from(value).expect("encoded values fit in u32"))
    }

    fn size_hint(&self) -> (usize, Option<usize>) {
        let remaining = self.encoded.len - self.index;
        (remaining, Some(remaining))
    }
}

impl ExactSizeIterator for EliasFanoIter<'_> {}
impl std::iter::FusedIterator for EliasFanoIter<'_> {}

fn words_for_bits(bit_len: usize) -> Result<usize, EliasFanoError> {
    bit_len
        .checked_add(63)
        .map(|rounded| rounded / 64)
        .ok_or(EliasFanoError::LengthOverflow)
}

fn mask(bits: u8) -> u64 {
    match bits {
        0 => 0,
        64 => u64::MAX,
        _ => (1_u64 << bits) - 1,
    }
}

fn write_bits(words: &mut [u64], start: usize, bits: u8, value: u64) {
    if bits == 0 {
        return;
    }
    let word_index = start / 64;
    let offset = start % 64;
    words[word_index] |= value << offset;
    if offset + usize::from(bits) > 64 {
        words[word_index + 1] |= value >> (64 - offset);
    }
}

fn read_bits(words: &[u64], start: usize, bits: u8) -> u64 {
    if bits == 0 {
        return 0;
    }
    let word_index = start / 64;
    let offset = start % 64;
    let mut value = words[word_index] >> offset;
    if offset + usize::from(bits) > 64 {
        value |= words[word_index + 1] << (64 - offset);
    }
    value & mask(bits)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trips_empty_and_single_value_sequences() {
        let empty = EliasFano::from_sorted(&[]).unwrap();
        assert!(empty.is_empty());
        assert_eq!(empty.iter().collect::<Vec<_>>(), Vec::<u32>::new());

        let single = EliasFano::from_sorted(&[u32::MAX]).unwrap();
        assert_eq!(single.get(0), Some(u32::MAX));
        assert_eq!(single.get(1), None);
    }

    #[test]
    fn round_trips_values_across_word_boundaries() {
        let values = (0..500)
            .map(|index| (index * index * 17 + index * 3) as u32)
            .collect::<Vec<_>>();
        let encoded = EliasFano::from_sorted(&values).unwrap();

        assert_eq!(encoded.len(), values.len());
        assert_eq!(encoded.iter().collect::<Vec<_>>(), values);
        assert_eq!(encoded.get(values.len()), None);
    }

    #[test]
    fn test_next_geq() {
        let values = [10, 25, 30, 42, 100, 250, 1000];
        let ef = EliasFano::from_sorted(&values).unwrap();

        assert_eq!(ef.next_geq(5, 0), Some((0, 10)));
        assert_eq!(ef.next_geq(10, 0), Some((0, 10)));
        assert_eq!(ef.next_geq(11, 0), Some((1, 25)));
        assert_eq!(ef.next_geq(35, 0), Some((3, 42)));
        assert_eq!(ef.next_geq(1000, 0), Some((6, 1000)));
        assert_eq!(ef.next_geq(1001, 0), None);
        assert_eq!(ef.next_geq(30, 3), Some((3, 42))); // starting from index 3
    }
}
