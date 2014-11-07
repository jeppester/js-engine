module.exports =
  compile:
    options:
      force: true
      ext: '.png'
    files: [
      {
        expand: true
        src: ['**/*.png']
        cwd: 'dist/assets'
        dest: 'dist/assets'
      }
    ]
