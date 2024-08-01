# find-unused-vars-vue

## Features

static analysis VUE SFC, marking the vars which has been defined but not used.

## Usage

Here provide two commands: fuvv(active fuvv) & cfuvv(clear fuvv).

when fuvv is active, it will automatically detect the file change, when file saved, or open other file, it will start analysing.

All unused variables detected by fuvv will be marked with gray and have the specific tooltip. 

run cfuvv to stop fuvv.

## Known Issues

just can static analysis, which means we can not deal the situation that the parent comp use the child comp's attr using ref, or mixin...


## Release Notes

### 1.0.0

publish...
