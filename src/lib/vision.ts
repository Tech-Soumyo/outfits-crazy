import vision from "@google-cloud/vision";

const client = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export async function analyzeImageDetails(imagePath: string) {
  const [labelResult] = await client.labelDetection(imagePath);
  const [colorResult] = await client.imageProperties(imagePath);
  const [objectResult] = await client.objectLocalization!(imagePath);

  const labels =
    labelResult.labelAnnotations
      ?.map((label) => label.description)
      .filter((label): label is string => !!label) || [];

  const colors =
    colorResult.imagePropertiesAnnotation?.dominantColors?.colors
      ?.map((color) =>
        color.color?.red !== undefined &&
        color.color?.green !== undefined &&
        color.color?.blue !== undefined
          ? `RGB(${color.color.red},${color.color.green},${color.color.blue})`
          : null
      )
      .filter((color): color is string => !!color) || [];

  const objects =
    objectResult.localizedObjectAnnotations
      ?.map((obj) => obj.name)
      .filter((name): name is string => !!name) || [];

  return { labels, colors, objects };
}
