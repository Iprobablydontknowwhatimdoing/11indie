const collections = ['posts', 'notes', 'bookmarks', 'replies'];

function getFromFolder(collectionApi, folder) {
  if (folder === 'all')
    return collections.flatMap((folderName) => getFromFolder(collectionApi, folderName));
  return collectionApi.getFilteredByGlob(`src/${folder}/**/*.md`).reverse();
}

function getAllBookmarks(collectionApi) {
  return getFromFolder('bookmarks');
}

function showInSitemap(collectionApi) {
  return collectionApi.getAll().filter(function (item) {
    return !item.data.eleventyExcludeFromCollections && item.url;
  });
}

function tagList(collectionApi) {
  var tags = new Set();
  collectionApi.getAll().forEach(function (item) {
    if (item.data.tags) {
      item.data.tags
        .filter(function (tag) {
          return !collections.includes(tag);
        })
        .forEach(function (tag) {
          tags.add(tag);
        });
    }
  });
  return Array.from(tags).sort();
}

function getAllContent(collectionApi) {
  return [
    ...collectionApi.getFromFolder('all')
  ].sort(function (a, b) {
    return b.date - a.date;
  });
}

module.exports = { getFromFolder, getAllContent, showInSitemap, tagList };
