const fm = require("front-matter");
const marked = require("marked");
const { readFileSync } = require("fs");
const pMemoize = require("p-memoize");
const data = require("../_posts/_data.json");

const getEvents = () => {
  return data.posts.map(post => {
    const markdown = readFileSync("../_posts/" + post, "utf8");
    const parsed = fm(markdown);
    const date = parsed.attributes.date
      ? new Date(parsed.attributes.date + " GMT+0200")
      : new Date(
          post
            .split("-")
            .slice(0, 2)
            .join("-") + " GMT+0200"
        );

    return {
      title: parsed.attributes.title || post.replace(".md", ""),
      link: `https://copenhagenjs.dk/archive/${post.replace(".md", "")}/`,
      markdown: parsed.body,
      content: marked(parsed.body),
      date,
      type: parsed.attributes.type || "",
      presentations: parsed.attributes.speakers || []
    };
  });
};

exports.getEvents = getEvents;

const memGetEvents = pMemoize(getEvents, {
  maxAge: 1000 * 3600
});

exports.memGetEvents = memGetEvents;
