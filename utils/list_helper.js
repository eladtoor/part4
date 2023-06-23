const dummy = (blogs) => {
  return 1;
};
const totalLikes = (blogList) => {
  const reducer = (sum, blog) => sum + blog.likes;
  return blogList.reduce(reducer, 0);
};

const favoriteBlog = (blogList) => {
  let max = 0;
  let index = 0;
  blogList.forEach((blog, i) => {
    if (blog.likes > max) {
      max = blog.likes;
      index = i;
    }
  });

  return blogList[index];
};

const mostBlogs = (blogList) => {
  let max = 0;
  let index = 0;

  blogList.forEach((blog, i) => {
    if (blog.blogs > max) {
      max = blog.blogs;
      index = i;
    }
  });

  return { author: blogList[index].author, blogs: blogList[index].blogs };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
};
