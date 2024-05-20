import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  clean: true,
  entries: [
    'src/index',
    'src/client',
  ],
})
