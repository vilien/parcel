const Packager = require('./Packager');
const path = require('path');
const fs = require('../utils/fs');

class RawPackager extends Packager {
  // Override so we don't create a file for this bundle.
  // Each asset will be emitted as a separate file instead.
  setup() {}

  async addAsset(asset) {
    let contents = asset.generated[asset.type];
    let bundleName = this.bundle.name;
    let extname = path.extname(asset.name);
    let basename = path.basename(asset.name, extname);
    let patt = new RegExp(`${basename}\\.[0-9a-f]+-\\d+${extname}`);
    if (!contents || (contents && contents.path)) {
      contents = await fs.readFile(contents ? contents.path : asset.name);
    }

    // Create sub-directories if needed
    if (this.bundle.name.includes(path.sep)) {
      await fs.mkdirp(path.dirname(this.bundle.name));
    }

    this.size = contents.length;

    // Fix bundleName
    for (let key in asset.generated) {
      let mat;
      if (
        typeof asset.generated[key] === 'string' &&
        (mat = asset.generated[key].match(patt))
      ) {
        bundleName = bundleName.replace(path.basename(bundleName), mat[0]);
        break;
      }
    }

    await fs.writeFile(bundleName, contents);
  }

  getSize() {
    return this.size || 0;
  }

  end() {}
}

module.exports = RawPackager;
