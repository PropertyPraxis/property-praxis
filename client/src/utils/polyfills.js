// simple dumb pagination
Array.prototype.paginate = function (pageNumber, itemsPerPage) {
  pageNumber = Number(pageNumber);
  itemsPerPage = Number(itemsPerPage);
  pageNumber = pageNumber < 1 || isNaN(pageNumber) ? 1 : pageNumber;
  itemsPerPage = itemsPerPage < 1 || isNaN(itemsPerPage) ? 1 : itemsPerPage;

  let start = (pageNumber - 1) * itemsPerPage;
  let end = start + itemsPerPage;
  let loopCount = 0;
  let result = {
    pageData: [],
    end: false,
  };

  for (loopCount = start; loopCount < end; loopCount++) {
    this[loopCount] && result.pageData.push(this[loopCount]);
  }

  if ((loopCount === this.length) | (loopCount > this.length)) {
    result.end = true;
  }
  return result;
};
