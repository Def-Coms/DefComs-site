// Archive card for a page: explicit `blog` frontmatter, or derived from a Markdown `article`.
export function blogCard(data: any) {
  if (data.blog) return data.blog;
  const a = data.article;
  if (!a) return undefined;
  return {
    categories: a.categories,
    date: a.published,
    order: 0,
    title: data.title.replace(/\s*\|\s*DefComs$/, ''),
    summary: data.description,
    image: a.image,
    imageAlt: a.imageAlt,
    imageWidth: 1200,
    imageHeight: 675,
    ariaLabel: undefined,
    cta: 'Прочетете ръководството →',
  };
}
