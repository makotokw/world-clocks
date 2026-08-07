# World Clocks (Browser Extension)

A simple world clocks browser extension.

Chrome Web Store: https://chrome.google.com/extensions/detail/innfmeekncjandlanpgdmmogkcimekgo

This extension uses [CoolClock](https://github.com/simonbaird/CoolClock/) (by Simon Baird)
to render lightweight, canvas-based analog clocks for each city or timezone. CoolClock provides customizable skins, smooth hands animation, and accurate rendering with timezone offsets.

## Development

This project uses Yarn 4. Common commands:

- `yarn dev` - start the Vite dev server
- `yarn build` - build the extension into `dist/` and create the release zip
- `yarn update-tz` - regenerate `src/common/data/time-zones.json`
- `yarn lint` - run ESLint
- `yarn format` - format files with Prettier

## License

This project is licensed under the MIT License, see the [LICENSE](LICENSE) file for details.
