use serde::{Deserialize, Serialize};

/// 8-bit Scalar Quantized vector representation.
/// Reduces vector memory consumption by 4x (e.g., 1.54 GB down to ~384 MB for 1M 384-dim docs)
/// and accelerates dot products via integer arithmetic and SIMD friendly unrolling.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct SQ8Vector {
    pub min_val: f32,
    pub diff: f32,
    pub sum_quant: u32,
    pub quantized: Vec<u8>,
}

impl SQ8Vector {
    /// Quantize a 32-bit floating-point vector into 8-bit unsigned integers.
    /// Formula: v_quant = round((v - min) / (max - min) * 255)
    pub fn quantize(vector: &[f32]) -> Self {
        if vector.is_empty() {
            return Self {
                min_val: 0.0,
                diff: 0.0,
                sum_quant: 0,
                quantized: Vec::new(),
            };
        }

        let mut min_val = f32::INFINITY;
        let mut max_val = f32::NEG_INFINITY;

        for &val in vector {
            if val < min_val {
                min_val = val;
            }
            if val > max_val {
                max_val = val;
            }
        }

        let diff = max_val - min_val;
        let scale = if diff > 1e-8 { 255.0 / diff } else { 0.0 };

        let mut quantized = Vec::with_capacity(vector.len());
        let mut sum_quant = 0u32;

        for &val in vector {
            let q = if scale > 0.0 {
                ((val - min_val) * scale).round().clamp(0.0, 255.0) as u8
            } else {
                128
            };
            quantized.push(q);
            sum_quant += q as u32;
        }

        Self {
            min_val,
            diff,
            sum_quant,
            quantized,
        }
    }

    /// Reconstruct the floating-point vector from its 8-bit quantized representation.
    pub fn dequantize(&self) -> Vec<f32> {
        if self.quantized.is_empty() {
            return Vec::new();
        }
        let inv_scale = self.diff / 255.0;
        self.quantized
            .iter()
            .map(|&q| self.min_val + (q as f32) * inv_scale)
            .collect()
    }

    /// Dimension of the vector.
    pub fn dim(&self) -> usize {
        self.quantized.len()
    }

    /// Asymmetric dot product: unquantized query vector with SQ8 document vector.
    /// Standard in high-performance vector search (avoids quantizing the query).
    /// dot = sum(query[i] * (min + diff / 255 * q[i]))
    ///     = min * sum(query) + (diff / 255) * sum(query[i] * q[i])
    #[inline]
    pub fn dot_product_asymmetric(&self, query: &[f32], query_sum: f32) -> f32 {
        let n = self.quantized.len().min(query.len());
        if n == 0 {
            return 0.0;
        }

        let q_bytes = &self.quantized[..n];
        let q_floats = &query[..n];

        // Process in 8-element unrolled chunks for cache locality and SIMD auto-vectorization
        let chunks = n / 8;
        let remainder = n % 8;

        let mut dot_acc = 0.0f32;

        for i in 0..chunks {
            let offset = i * 8;
            let b = &q_bytes[offset..offset + 8];
            let f = &q_floats[offset..offset + 8];

            dot_acc += (b[0] as f32) * f[0]
                + (b[1] as f32) * f[1]
                + (b[2] as f32) * f[2]
                + (b[3] as f32) * f[3]
                + (b[4] as f32) * f[4]
                + (b[5] as f32) * f[5]
                + (b[6] as f32) * f[6]
                + (b[7] as f32) * f[7];
        }

        let tail_offset = chunks * 8;
        for i in 0..remainder {
            dot_acc += (q_bytes[tail_offset + i] as f32) * q_floats[tail_offset + i];
        }

        let scale = self.diff / 255.0;
        self.min_val * query_sum + scale * dot_acc
    }

    /// Symmetric dot product between two SQ8 vectors using fast integer arithmetic.
    #[inline]
    pub fn dot_product_symmetric(&self, other: &SQ8Vector) -> f32 {
        let n = self.quantized.len().min(other.quantized.len());
        if n == 0 {
            return 0.0;
        }

        let a = &self.quantized[..n];
        let b = &other.quantized[..n];

        let chunks = n / 8;
        let remainder = n % 8;

        let mut int_dot = 0u64;

        for i in 0..chunks {
            let offset = i * 8;
            let a_chunk = &a[offset..offset + 8];
            let b_chunk = &b[offset..offset + 8];

            int_dot += (a_chunk[0] as u64) * (b_chunk[0] as u64)
                + (a_chunk[1] as u64) * (b_chunk[1] as u64)
                + (a_chunk[2] as u64) * (b_chunk[2] as u64)
                + (a_chunk[3] as u64) * (b_chunk[3] as u64)
                + (a_chunk[4] as u64) * (b_chunk[4] as u64)
                + (a_chunk[5] as u64) * (b_chunk[5] as u64)
                + (a_chunk[6] as u64) * (b_chunk[6] as u64)
                + (a_chunk[7] as u64) * (b_chunk[7] as u64);
        }

        let tail_offset = chunks * 8;
        for i in 0..remainder {
            int_dot += (a[tail_offset + i] as u64) * (b[tail_offset + i] as u64);
        }

        let sa = self.diff / 255.0;
        let sb = other.diff / 255.0;

        (n as f32) * self.min_val * other.min_val
            + self.min_val * sb * (other.sum_quant as f32)
            + other.min_val * sa * (self.sum_quant as f32)
            + sa * sb * (int_dot as f32)
    }

    /// Computes approximate cosine similarity against a query vector.
    #[inline]
    pub fn cosine_similarity_asymmetric(&self, query: &[f32], query_sum: f32, query_norm: f32) -> f32 {
        let dot = self.dot_product_asymmetric(query, query_sum);
        // Compute SQ8 norm:
        let norm_sq = self.dot_product_symmetric(self);
        let doc_norm = norm_sq.max(1e-12).sqrt();
        if doc_norm * query_norm > 1e-12 {
            (dot / (doc_norm * query_norm)).clamp(-1.0, 1.0)
        } else {
            0.0
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sq8_quantization_roundtrip() {
        let original = vec![0.12, -0.45, 0.88, 1.23, -0.99, 0.05, 0.77, 0.33];
        let sq8 = SQ8Vector::quantize(&original);
        assert_eq!(sq8.dim(), 8);

        let reconstructed = sq8.dequantize();
        for (orig, recon) in original.iter().zip(reconstructed.iter()) {
            let err = (orig - recon).abs();
            assert!(err < 0.02, "Error too large: orig={}, recon={}", orig, recon);
        }
    }

    #[test]
    fn test_asymmetric_dot_product() {
        let doc = vec![0.1, 0.5, -0.2, 0.8, -0.4, 0.9, 0.3, -0.1];
        let query = vec![0.2, 0.4, 0.1, 0.7, -0.3, 0.8, 0.2, 0.0];
        let query_sum: f32 = query.iter().sum();

        let exact_dot: f32 = doc.iter().zip(query.iter()).map(|(a, b)| a * b).sum();

        let sq8 = SQ8Vector::quantize(&doc);
        let approx_dot = sq8.dot_product_asymmetric(&query, query_sum);

        let relative_error = (exact_dot - approx_dot).abs() / exact_dot.abs().max(1e-5);
        assert!(relative_error < 0.05, "Relative error too large: exact={}, approx={}", exact_dot, approx_dot);
    }
}
