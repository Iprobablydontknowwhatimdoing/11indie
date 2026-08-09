const pluginYaml = require('js-yaml');
const pluginFeed = require('@11ty/eleventy-plugin-rss');
const pluginWebc = require("@11ty/eleventy-plugin-webc");
const { getFromFolder, getAllContent, showInSitemap, tagList } = require('./src/_config/collections');
const filters = require('./src/_config/filters');
const { year, image } = require('./src/_config/shortcodes');
const events = require('./src/_config/events');
const meta = require('./src/_data/meta');

module.exports = function (eleventyConfig) {
  
  // Plugins
  /* eleventyConfig.addPlugin(pluginFeed, {
    type: "atom",
    outputPath: "/feed.xml",
    collection: {
			name: "all", // iterate over `collections.posts`
			limit: 10,     // 0 means no limit
		},
    metadata: {
			language: meta.lang,
			title: meta.siteName,
			subtitle: meta.siteDescription,
			base: meta.url,
			author: {
				name: meta.name,
				email: meta.email,
			}
		}
  }); */

  eleventyConfig.addPlugin(pluginWebc, {
    components: ["src/_includes/**/*.webc"],
  });
  
  // Build events
  eleventyConfig.on('eleventy.after', async function () {
    await events.cssBundle();
    await events.svgToJpeg();
  });

  // Watch targets
  eleventyConfig.addWatchTarget('./src/assets/**/*.css');

  // Layout aliases
  eleventyConfig.addLayoutAlias('base', 'base.webc');
  eleventyConfig.addLayoutAlias('post', 'post.webc');

  // Collections
  eleventyConfig.addCollection('allPosts', (collectionsApi) => getFromFolder(collectionsApi, 'all'));
  eleventyConfig.addCollection('allNotes', (collectionsApi) => getFromFolder(collectionsApi, 'notes'));
  eleventyConfig.addCollection('allBookmarks', (collectionsApi) => getFromFolder(collectionsApi, 'bookmarks'));
  eleventyConfig.addCollection('allReplies', (collectionsApi) => getFromFolder(collectionsApi, 'replies'));
  eleventyConfig.addCollection('allContent', (collectionsApi) => getFromFolder(collectionsApi, 'content'));
  eleventyConfig.addCollection('showInSitemap', showInSitemap);
  eleventyConfig.addCollection('tagList', tagList);

  // Filters
  eleventyConfig.addFilter('toISOString', filters.toISOString);
  eleventyConfig.addFilter('formatDate', filters.formatDate);
  eleventyConfig.addFilter('splitlines', filters.splitlines);
  eleventyConfig.addFilter('slugify', filters.slugify);
  eleventyConfig.addFilter('head', filters.head);
  eleventyConfig.addFilter('getWebmentionsForUrl', filters.getWebmentionsForUrl);
  eleventyConfig.addFilter('getWebmentionsByType', filters.getWebmentionsByType);

  // Shortcodes
  eleventyConfig.addShortcode('year', year);
  eleventyConfig.addAsyncShortcode('image', image);

  // Per-page CSS bundling
  eleventyConfig.addBundle('css', { hoist: true });

  // YAML data file support
  eleventyConfig.addDataExtension('yaml', function (contents) {
    return pluginYaml.load(contents);
  });

  // Passthrough copy (CSS handled by cssBundle build event)
  eleventyConfig.addPassthroughCopy('src/assets/fonts');
  eleventyConfig.addPassthroughCopy('src/assets/images');
  eleventyConfig.addPassthroughCopy('src/assets/js');
  eleventyConfig.addPassthroughCopy('src/assets/svg');
  eleventyConfig.addPassthroughCopy('src/assets/og-images');

  return {
    dir: {
      input: 'src',
      includes: '_includes',
      layouts: '_layouts',
      data: '_data',
      output: '_site'
    },
    templateFormats: ['njk', 'liquid', 'md', 'html', 'webc'],
    htmlTemplateEngine: 'webc',
    markdownTemplateEngine: 'njk'
  };
};
