require('../prepare-story-sprite.cjs')('04').catch(error => {
  console.error(error);
  process.exitCode = 1;
});
