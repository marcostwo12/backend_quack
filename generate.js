const gTTS = require('gtts');
const fs = require('fs');
const path = require('path');
const outputDir = path.join(__dirname);
const outputPathTitle = path.join(outputDir, `title.mp3`);
const outputPathContent = path.join(outputDir, `content.mp3`);

const titulo = new gTTS('Por favor, informe o titulo da nota', 'pt', 'com.br');
titulo.save(outputPathTitle, async function (err, result) {
  if (err) { throw new Error(err); }
});
const content = new gTTS('Por favor, descreva o que foi estudado', 'pt', 'com.br');
content.save(outputPathContent, async function (err, result) {
  if (err) { throw new Error(err); }
});