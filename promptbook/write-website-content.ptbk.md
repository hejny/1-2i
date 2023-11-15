# 🌍 Create website content

Instructions for creating web page content using [🌠 Prompt template pipelines](https://github.com/webgptorg/promptbook).

-   PTBK URL https://ptbk.webgpt.com/en/write-website-content.ptbk.md@v0.1.0
-   PTBK version 0.0.1
-   Use chat
<!-- TODO: [🌚]> - Use GPT-3.5 -->
-   Input param `{idea}` General ideal of the web
-   Input param `{rawTitle}` Automatically suggested a site name or empty text
-   Input param `{rawAssignment}` Automatically generated site entry from image recognition
-   Output param `{content}` Web content
-   Output param `{wallpaperPrompt}` Prompt pro obrázkový model _v Angličtině_<!-- TODO: !!> , only if there is no ... -->

## 👤 Specifying the assignment

What is your web about?

-   Prompt dialog

```text
{rawAssignment}
```

`-> {assignment}` Website assignment and specification

## 🖋 Image prompt

-   Use completion
-   Postprocessing `trim`
    <!-- TODO: !!> Skip if `rawAssignment!==''` -->
    <!-- TODO: Maybe more samples... -->

```markdown
## Illustrative pictures

## Café

### Site assignment

Create a website for a cafe in Prague called "Space Cafe", which is all about space.

### Introduction image

A large mug full of coffee with milk foam, on which a galaxy is depicted. The mug is on a table with a book about space and coffee beans on it.

## {purpose}

### Web assignment

{assignment}

### Introduction image
```

`-> {wallpaperPrompt}`

## 💬 Improvement of the web title

-   Postprocessing `unwrapResult`

```markdown
As an experienced marketing specialist, you have been entrusted with improving the name of your client's business.

A suggested name from a client:
"{rawTitle}"

Assignment from customer:

\`\`\`
{assignment}
\`\`\`

## Instructions:

-   Write only one name suggestion
-   The name will be used on the website, business cards, visuals, etc.
```

`-> {enhancedTitle}` Enhanced title

## 👤 Schválení názvu uživatelem

Is the title for your website okay?

-   Prompt dialog

```text
{enhancedTitle}
```

`-> {title}` Title for the website

## 💬 Cunning subtitle

-   Postprocessing `unwrapResult`

```markdown
As an experienced copywriter, you have been entrusted with creating a claim for the "{title}" web page.

A website assignment from a customer:

\`\`\`
{assignment}
\`\`\`

## Instructions:

-   Write only one name suggestion
-   Claim will be used on website, business cards, visuals, etc.
-   Claim should be punchy, funny, original
```

`-> {claim}` Claim for the web

## 💬 Keyword analysis

<!--
Note+TODO: This is not a real keyword analysis, but rather a list of keywords that should be used in the content.
-->

```markdown
As an experienced SEO specialist, you have been entrusted with creating keywords for the website "{title}".

Website assignment from the customer:

\`\`\`
{assignment}
\`\`\`

## Instructions:

-   Write a list of keywords
-   Keywords are in basic form

## Example:

-   Ice cream
-   Olomouc
-   Quality
-   Family
-   Tradition
-   Italy
-   Craft
```

`-> {keywords}` Keywords

## 🔗 Vytvoření začátku obsahu webu

-   Simple template

```text

# {title}

> {claim}

```

`-> {contentBeginning}` Beginning of web content

## 🖋 Writing web content

-   Use completion
<!-- TODO: [🌚]> -   Use GPT-3 -->

```markdown
As an experienced copywriter and web designer, you have been entrusted with creating text for a new website {title}.

A website assignment from a customer:

\`\`\`
{assignment}
\`\`\`

## Instructions:

-   Text formatting is in Markdown
-   Be concise and to the point
-   Use keywords, but they should be naturally in the text
-   This is the complete content of the page, so don't forget all the important information and elements the page should contain
-   Use headings, bullets, text formatting

## Keywords:

{keywords}

## Web Content:

{contentBeginning}
```

`-> {contentBody}` Middle of the web content

## 🔗 Combine content

-   Simple template

```markdown
{contentBeginning}

{contentBody}
```

`-> {content}`
