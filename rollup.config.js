// rollup.config.js
import typescript from 'rollup-plugin-typescript2';
export default {
    input: 'src/main.ts',
    output: {
      file: 'main.js',
      format: 'cjs'
    },
    plugins: [
		typescript(/*{ plugin options }*/)
	]
  };