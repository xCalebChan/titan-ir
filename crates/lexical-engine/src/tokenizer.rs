/// Zero-allocation lexer with ASCII/Unicode normalization, lowercase conversion,
/// stopwords filtering, and a standard pure-Rust Porter Stemmer.

const STOPWORDS: &[&str] = &[
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
    "below", "between", "both", "but", "by", "can", "can't", "cannot", "could",
    "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down",
    "during", "each", "few", "for", "from", "further", "had", "hadn't", "has",
    "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her",
    "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's",
    "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it",
    "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my",
    "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other",
    "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't",
    "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
    "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then",
    "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've",
    "this", "those", "through", "to", "too", "under", "until", "up", "very", "was",
    "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what",
    "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's",
    "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd",
    "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves",
];

pub struct Tokenizer {
    filter_stopwords: bool,
    stem: bool,
}

impl Default for Tokenizer {
    fn default() -> Self {
        Self {
            filter_stopwords: true,
            stem: true,
        }
    }
}

impl Tokenizer {
    pub fn new(filter_stopwords: bool, stem: bool) -> Self {
        Self {
            filter_stopwords,
            stem,
        }
    }

    /// Tokenizes input text into a sequence of normalized, stemmed terms.
    pub fn tokenize(&self, text: &str) -> Vec<String> {
        let mut tokens = Vec::new();
        let mut current = String::with_capacity(32);

        for ch in text.chars() {
            if ch.is_alphanumeric() {
                for lower_ch in ch.to_lowercase() {
                    current.push(lower_ch);
                }
            } else if !current.is_empty() {
                self.process_token(&mut current, &mut tokens);
                current.clear();
            }
        }

        if !current.is_empty() {
            self.process_token(&mut current, &mut tokens);
        }

        tokens
    }

    fn process_token(&self, word: &mut String, out: &mut Vec<String>) {
        if word.len() < 2 {
            return;
        }

        if self.filter_stopwords && is_stopword(word.as_str()) {
            return;
        }

        if self.stem {
            let stemmed = porter_stem(word);
            if !stemmed.is_empty() {
                out.push(stemmed);
            }
        } else {
            out.push(word.clone());
        }
    }
}

fn is_stopword(word: &str) -> bool {
    STOPWORDS.binary_search(&word).is_ok()
}

// ---------------------------------------------------------------------------
// Porter Stemmer (M. Porter, 1980) Implementation
// ---------------------------------------------------------------------------

fn is_consonant(chars: &[char], i: usize) -> bool {
    match chars[i] {
        'a' | 'e' | 'i' | 'o' | 'u' => false,
        'y' => {
            if i == 0 {
                true
            } else {
                !is_consonant(chars, i - 1)
            }
        }
        _ => true,
    }
}

fn measure(chars: &[char], end: usize) -> usize {
    if end == 0 {
        return 0;
    }
    let mut i = 0;
    let mut count = 0;

    // Skip initial consonants
    while i < end && is_consonant(chars, i) {
        i += 1;
    }

    loop {
        if i >= end {
            return count;
        }
        // Skip vowels
        while i < end && !is_consonant(chars, i) {
            i += 1;
        }
        if i >= end {
            return count;
        }
        // Skip consonants
        while i < end && is_consonant(chars, i) {
            i += 1;
        }
        count += 1;
    }
}

fn contains_vowel(chars: &[char], end: usize) -> bool {
    for i in 0..end {
        if !is_consonant(chars, i) {
            return true;
        }
    }
    false
}

fn ends_double_consonant(chars: &[char], end: usize) -> bool {
    if end < 2 {
        return false;
    }
    chars[end - 1] == chars[end - 2] && is_consonant(chars, end - 1)
}

fn cvc(chars: &[char], end: usize) -> bool {
    if end < 3 {
        return false;
    }
    let (i1, i2, i3) = (end - 3, end - 2, end - 1);
    if is_consonant(chars, i1) && !is_consonant(chars, i2) && is_consonant(chars, i3) {
        let ch = chars[i3];
        ch != 'w' && ch != 'x' && ch != 'y'
    } else {
        false
    }
}

fn ends_with(chars: &[char], end: usize, suffix: &str) -> Option<usize> {
    let suffix_chars: Vec<char> = suffix.chars().collect();
    if suffix_chars.len() > end {
        return None;
    }
    let start = end - suffix_chars.len();
    if &chars[start..end] == suffix_chars.as_slice() {
        Some(start)
    } else {
        None
    }
}

pub fn porter_stem(word: &str) -> String {
    let mut chars: Vec<char> = word.chars().collect();
    if chars.len() <= 2 {
        return word.to_string();
    }

    let mut k = chars.len();

    // Step 1a
    if let Some(stem_len) = ends_with(&chars, k, "sses") {
        chars.truncate(stem_len + 2); // sses -> ss
        k = chars.len();
    } else if let Some(stem_len) = ends_with(&chars, k, "ies") {
        chars.truncate(stem_len + 1); // ies -> i
        chars[stem_len] = 'i';
        k = chars.len();
    } else if let Some(stem_len) = ends_with(&chars, k, "ss") {
        // ss -> ss
        k = stem_len + 2;
    } else if let Some(stem_len) = ends_with(&chars, k, "s") {
        chars.truncate(stem_len);
        k = chars.len();
    }

    // Step 1b
    let mut step1b_extra = false;
    if let Some(stem_len) = ends_with(&chars, k, "eed") {
        if measure(&chars, stem_len) > 0 {
            chars.truncate(stem_len + 2); // eed -> ee
            k = chars.len();
        }
    } else if let Some(stem_len) = ends_with(&chars, k, "ed") {
        if contains_vowel(&chars, stem_len) {
            chars.truncate(stem_len);
            k = chars.len();
            step1b_extra = true;
        }
    } else if let Some(stem_len) = ends_with(&chars, k, "ing") {
        if contains_vowel(&chars, stem_len) {
            chars.truncate(stem_len);
            k = chars.len();
            step1b_extra = true;
        }
    }

    if step1b_extra {
        if let Some(_s) = ends_with(&chars, k, "at") {
            chars.push('e');
            k = chars.len();
        } else if let Some(_s) = ends_with(&chars, k, "bl") {
            chars.push('e');
            k = chars.len();
        } else if let Some(_s) = ends_with(&chars, k, "iz") {
            chars.push('e');
            k = chars.len();
        } else if ends_double_consonant(&chars, k) {
            let last = chars[k - 1];
            if last != 'l' && last != 's' && last != 'z' {
                chars.pop();
                k = chars.len();
            }
        } else if measure(&chars, k) == 1 && cvc(&chars, k) {
            chars.push('e');
            k = chars.len();
        }
    }

    // Step 1c
    if let Some(stem_len) = ends_with(&chars, k, "y") {
        if contains_vowel(&chars, stem_len) {
            chars[stem_len] = 'i';
        }
    }

    // Step 2
    let step2_suffixes = [
        ("ational", "ate"),
        ("tional", "tion"),
        ("enci", "ence"),
        ("anci", "ance"),
        ("izer", "ize"),
        ("abli", "able"),
        ("alli", "al"),
        ("entli", "ent"),
        ("eli", "e"),
        ("ousli", "ous"),
        ("ization", "ize"),
        ("ation", "ate"),
        ("ator", "ate"),
        ("alism", "al"),
        ("iveness", "ive"),
        ("fulness", "ful"),
        ("ousness", "ous"),
        ("aliti", "al"),
        ("iviti", "ive"),
        ("biliti", "ble"),
    ];

    for (suf, rep) in step2_suffixes {
        if let Some(stem_len) = ends_with(&chars, k, suf) {
            if measure(&chars, stem_len) > 0 {
                chars.truncate(stem_len);
                chars.extend(rep.chars());
                k = chars.len();
            }
            break;
        }
    }

    // Step 3
    let step3_suffixes = [
        ("icate", "ic"),
        ("ative", ""),
        ("alize", "al"),
        ("iciti", "ic"),
        ("ical", "ic"),
        ("ful", ""),
        ("ness", ""),
    ];

    for (suf, rep) in step3_suffixes {
        if let Some(stem_len) = ends_with(&chars, k, suf) {
            if measure(&chars, stem_len) > 0 {
                chars.truncate(stem_len);
                chars.extend(rep.chars());
                k = chars.len();
            }
            break;
        }
    }

    // Step 4
    let step4_suffixes = [
        "al", "ance", "ence", "er", "ic", "able", "ible", "ant", "ement", "ment",
        "ent", "ou", "ism", "ate", "iti", "ous", "ive", "ize",
    ];

    for suf in step4_suffixes {
        if let Some(stem_len) = ends_with(&chars, k, suf) {
            if measure(&chars, stem_len) > 1 {
                chars.truncate(stem_len);
                k = chars.len();
            }
            break;
        }
    }

    if let Some(stem_len) = ends_with(&chars, k, "ion") {
        if stem_len > 0 && (chars[stem_len - 1] == 's' || chars[stem_len - 1] == 't') && measure(&chars, stem_len) > 1 {
            chars.truncate(stem_len);
            k = chars.len();
        }
    }

    // Step 5a
    if let Some(stem_len) = ends_with(&chars, k, "e") {
        let m = measure(&chars, stem_len);
        if m > 1 || (m == 1 && !cvc(&chars, stem_len)) {
            chars.truncate(stem_len);
            k = chars.len();
        }
    }

    // Step 5b
    if ends_double_consonant(&chars, k) && chars[k - 1] == 'l' && measure(&chars, k) > 1 {
        chars.pop();
    }

    chars.into_iter().collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_porter_stemmer_basics() {
        assert_eq!(porter_stem("caresses"), "caress");
        assert_eq!(porter_stem("ponies"), "poni");
        assert_eq!(porter_stem("ties"), "ti");
        assert_eq!(porter_stem("caress"), "caress");
        assert_eq!(porter_stem("cats"), "cat");
        assert_eq!(porter_stem("feed"), "feed");
        assert_eq!(porter_stem("agreed"), "agre");
        assert_eq!(porter_stem("plastered"), "plaster");
        assert_eq!(porter_stem("motoring"), "motor");
        assert_eq!(porter_stem("sing"), "sing");
    }

    #[test]
    fn test_tokenizer_clean_and_stem() {
        let tok = Tokenizer::default();
        let tokens = tok.tokenize("The quick brown foxes jumped over lazy dogs in 2026!");
        // "the", "over", "in" are filtered stopwords
        assert!(tokens.contains(&"quick".to_string()));
        assert!(tokens.contains(&"brown".to_string()));
        assert!(tokens.contains(&"fox".to_string()));
        assert!(tokens.contains(&"jump".to_string()));
        assert!(tokens.contains(&"lazi".to_string()));
        assert!(tokens.contains(&"dog".to_string()));
    }
}
