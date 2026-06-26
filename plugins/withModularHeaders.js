const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withModularHeaders(config) {
  return withDangerousMod(config, [
    'ios',
    (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfilePath, 'utf-8');
      if (!contents.includes('use_modular_headers!')) {
        contents = contents.replace(
          /(platform :ios[^\n]*\n)/,
          '$1use_modular_headers!\n'
        );
        fs.writeFileSync(podfilePath, contents);
      }
      return config;
    },
  ]);
};
