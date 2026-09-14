export default async function handler(req, res) {

  try {

    const feed =
      "https://feeds.bbci.co.uk/news/rss.xml";


    const response =
      await fetch(feed);


    if (!response.ok) {

      throw new Error(
        "RSS request failed"
      );

    }


    const xml =
      await response.text();


    const items = [];


    const matches =
      xml.match(
        /<item[\s\S]*?<\/item>/g
      ) || [];


    for (
      const item of matches.slice(0, 10)
    ) {


      const titleMatch =
        item.match(
          /<title><!\[CDATA\[(.*?)\]\]><\/title>/
        );


      const linkMatch =
        item.match(
          /<link>(.*?)<\/link>/
        );


      const title =
        titleMatch
          ? titleMatch[1]
          : "";


      const link =
        linkMatch
          ? linkMatch[1]
          : "";


      if (title) {

        items.push({

          title,

          link

        });

      }

    }


    return res.status(200).json({

      success: true,

      items

    });


  } catch (error) {

    return res.status(500).json({

      error:
        error.message

    });

  }

}
