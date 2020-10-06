#!/bin/bash

for I in /sys/class/video4linux/*; do cat $I/name; done