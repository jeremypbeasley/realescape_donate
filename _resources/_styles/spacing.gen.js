// This is a node script that creates a css utilities file for various spacing. The increments and units below can be adjusted to suit your needs
// To run, navigate to the file in your console and run the command `node spacing.gen.js`
// Note: The file will write to the direction you're in when you run `node ...` so don't target it with a path, rather `cd` directly to the `_styles` folder where you want the .css file to appear

const fs = require('fs');

var data = '';

var increments = [
  '0', '4', '8', '16', '24', '32', '40', '48', '56', '64', '72'
]

var directions = [
  null, 'top', 'right', 'bottom', 'left'
]

var properties = [
  'margin', 'padding'
]

var units = 'rem';

function printCSS(property, direction, increment, value) {
  if (!direction) {
    data += '.' + property.charAt(0) + increment + ' { \n' + '\t' + property + ': ' + value / 10 + units + ';\n}\n\n'
  } else {
    data += '.' + property.charAt(0) + direction.charAt(0) + increment + ' { \n' + '\t' + property + '-' + direction + ': ' + value / 10 + units + ';\n} \n\n'
  }
}

// write all declarations
for (p = 0; p < properties.length; p++) {
  let property = properties[p];
  for (d = 0; d < directions.length; d++) {
    let direction = directions[d];
    for (i = 0; i < increments.length; i++) {
      let value = increments[i];
      printCSS(property, direction, i, value)
    }
  }
}

fs.writeFile('spacing.css', data)
