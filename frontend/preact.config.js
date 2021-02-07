import envVars from 'preact-cli-plugin-env-vars'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default (config, env, helpers) => {
  envVars(config, env, helpers)
}
