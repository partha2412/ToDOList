const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolve = originalResolveRequest ?? context.resolveRequest;

  if (moduleName === "nativewind/jsx-runtime") {
    return resolve(context, "react/jsx-runtime", platform);
  }

  if (moduleName === "nativewind/jsx-dev-runtime") {
    return resolve(context, "react/jsx-dev-runtime", platform);
  }

  return resolve(context, moduleName, platform);
};

module.exports = withNativewind(config);
