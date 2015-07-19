from collections import Counter
import sys

def read_words(words_file):
    return [word for line in open(words_file, 'r') for word in line.split()]

words = read_words(sys.argv[1])
minimum_word_length = 3
num_words = 20

counted_words = Counter(words)

for word in list(counted_words):
	if len(word) < minimum_word_length:
		del counted_words[word]

for word, count in counted_words.most_common(num_words):
	print str(count) + " " + word
