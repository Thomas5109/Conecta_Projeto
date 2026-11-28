const { withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = function withWatermelonBuildConfig(config) {
  return withProjectBuildGradle(config, (gradleConfig) => {
    const gradleString = gradleConfig.modResults.contents;

    const watermelonFix = `
// WatermelonDB BuildConfig fix for AGP 9.
subprojects { watermelonProject ->
    if (watermelonProject.name == "nozbe_watermelondb") {
        watermelonProject.pluginManager.withPlugin("com.android.library") {
            watermelonProject.extensions.findByName("android").buildFeatures.buildConfig = true
        }
    }
}
`;

    if (!gradleString.includes("WatermelonDB BuildConfig fix for AGP 9")) {
      gradleConfig.modResults.contents = gradleString + watermelonFix;
    }

    return gradleConfig;
  });
};
