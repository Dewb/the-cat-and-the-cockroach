#!/bin/bash
stty -icanon && sudo socat PTY,link=/dev/virtual-tty,raw,echo=0 -
