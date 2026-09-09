require('../prepare-story-sprite.cjs')('05').catch(error => {
  console.error(error);
  process.exitCode = 1;
});
