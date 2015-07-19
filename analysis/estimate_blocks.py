from collections import Counter
from itertools import chain, tee, izip
from codecs import open
import sys

def main(corpus):
    minimum_blockword_length = 3
    num_blockwords = 3

    blockwords = get_blockwords(corpus, minimum_blockword_length, num_blockwords)
    blocks = {}
    for l1, l2 in get_linepairs(corpus):
        for block, count in Counter(split_into_blocks(chain(l1.split(), l2.split()), blockwords)).most_common():
            if not block in blocks or blocks[block] < count:
                blocks[block] = count

    totalsize = 0
    singleblocks = []
    wordblocks = []
    for block, count in sorted(blocks.items(), key=lambda x: (-x[1], x[0])):
        print str(count) + " " + block
        totalsize = totalsize + len(block) * count
        if len(block) == 1:
            singleblocks.extend([block] * count)
        else:
            wordblocks.extend([block] * count)

    print "Total block size: " + str(totalsize)

    for l in wordblocks:
        if len(l) < 4 and len(singleblocks) > 4 - len(l):
            filler = singleblocks[0:(4 - len(l))]
            del singleblocks[0:(4 - len(l))]
            print l + ''.join(filler)
        else:
            print l
    for l in chunks(singleblocks, 4):
        print ''.join(l)


def chunks(l, n):
    for i in xrange(0, len(l), n):
        yield l[i:i+n]

def split_into_blocks(words, blockwords):
    for word in words:
        if word in blockwords:
            yield word.lower()
        else:
            for char in word:
                yield char.lower()

def read_words(words_file):
    return [word for line in open(words_file, 'r', encoding='UTF-8') for word in line.split()]

def get_blockwords(corpus, minimum_word_length, num_words):
    words = read_words(corpus)
    counted_words = Counter(words)

    for word in list(counted_words):
        if len(word) < minimum_word_length:
            del counted_words[word]

    return [word for word, count in counted_words.most_common(num_words)]

def pairwise(iterable):
    "s -> (s0,s1), (s1,s2), (s2, s3), ..."
    a, b = tee(iterable)
    next(b, None)
    return izip(a, b)

def nonblank_lines(f):
    for l in f:
        line = l.rstrip()
        if line:
            yield line

def nonlong_lines(maxlength, f):
    for l in f:
        if len(l) <= maxlength:
            yield l

def get_linepairs(corpus):
    return pairwise(nonblank_lines(nonlong_lines(60, open(corpus, 'r', encoding='UTF-8'))))


main(sys.argv[1])