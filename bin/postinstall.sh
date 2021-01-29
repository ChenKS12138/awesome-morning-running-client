#! /bin/sh 
PATTERN='s/removeSync/emptyDirSync/g'

# use fs.emptyDirSync insteadof fs.removeSync
# see https://github.com/ice-lab/build-scripts/issues/22
#     https://github.com/raxjs/rax-app/issues/595

sed -i "" $PATTERN ./node_modules/@alib/build-scripts/lib/commands/build.js &&\
sed -i "" $PATTERN ./node_modules/build-plugin-rax-app/lib/setDev.js &&\
sed -i "" $PATTERN ./node_modules/build-plugin-rax-app/src/setDev.js &&\
echo "REPLACE COMPLETE"