# 🌍 Vytvoření obsahu webové stránky

Instrukce pro vytvoření obsahu webové stránky za pomocí [🌠 Prompt template pipelines](https://github.com/webgptorg/ptp).

-   PTP URL https://ptp.webgpt.com/cs/write-wallpaper-content.ptp.md@v0.1.0
-   PTP version 0.0.1
-   Use chat
<!-- TODO: [🌚]> -   Use GPT-3.5 -->
-   Input param `{rawTitle}` Automatický návrh názvu webu _v Angličtině_ nebo prázdný text
-   Input param `{rawAssigment}` popis obrázku _v Angličtině_
-   Output param `{content}` Obsah webu _v Češtině_

## 🖋 Překlad popisu

-   Use completion
-   Postprocessing `trim`

```text

English assignment:
> {rawAssigment}

České zadání:
>
```

`-> {rawAssigmentCs}` popis obrázku v češtině


## Účel stránek

-   Use chat
-   Postprocessing `trim`
-   Postprocessing removeQuotes

```text

Navrhni možný účel webových stránek z čistého popisu co se nachází na obrázku

## Pravidla
- Piš jediný návrh
- Navrhni obecnou kategorii, např. "Autoservis" ne "Autoservis Pod Ohradou"

## Příklady
- "Kavárna" 
- "Autoservis"
- "Dětská herna" 
-" Svatba"
- "Osobní stránka fotografa" 

Text na obrázku:
> {rawAssigmentCs}


```

`-> {draftedPurpose}`Návrh účelu webu


## 👤 Upřesnění účelu uživatelem

Je toto účelem vašeho webu? 

-   Prompt dialog

```text
{draftedPurpose}
```

`-> {purpose}` Účel webu

## Návrh zadání

-   Use chat
-   Postprocessing `trim`

```text

Vytvoř zadání reálného webu pro {purpose} z čistého popisu co se nachází na obrázku

## Pravidla
- Účelem webu je {purpose} 
- Zadání je strukturované
- Zadání obsahuje konkrétní čísla, odrážky a je přesné
- Stručně, maximálně 5 bodů zadání

Text na obrázku:
> {rawAssigmentCs}


```

`-> {draftedAssigment}` Zadání webu v Češtině

## 👤 Upřesnění zadání uživatelem

Popište cíl vašeho webu

-   Prompt dialog

```text
{draftedAssigment}
```

`-> {assigment}` Zadání webu

## 💬 Vylepšení názvu

-   Postprocessing `unwrapResult`

```markdown
Jako zkušenému marketingovému specialistovi vám bylo svěřeno vylepšení názvu klientova podnikání.

Navrhovaný název od zákazníka:
"{rawTitle}"

Zadání od zákazníka:

\`\`\`
{assigment}
\`\`\`

## Pokyny:

-   Účelem webu je {purpose} 
-   Napiště pouze jeden návrh názvu
-   Název je v češtině
-   Název bude použit na webu, vizitkách, vizuálu, atd.
```

`-> {enhancedTitle}` Vylepšený název

## 👤 Schválení názvu uživatelem

Je název Vašeho webu v pořádku?

-   Prompt dialog

```text
{enhancedTitle}
```

`-> {title}` Název webu

## 💬 Claim pro web

-   Postprocessing `unwrapResult`

```markdown
Jako zkušenému copywriterovi vám bylo svěřeno vytvoření claimu pro webovou stránku "{title}".

Zadání webu od zákazníka:

\`\`\`
{assigment}
\`\`\`

## Pokyny:


-   Účelem webu je {purpose} 
-   Napiště pouze jeden návrh názvu
-   Claim bude použit na webu, vizitkách, vizuálu, atd.
-   Claim má být rázný, vtipný, originální
```

`-> {claim}` Podtitulek pro web

## 💬 Analýza klíčových slov

<!--
Note+TODO: This is not a real keyword analysis, but rather a list of keywords that should be used in the content.
-->

```markdown
Jako zkušenému SEO specialistovi vám bylo svěřeno vytvoření klíčových slov pro webovou stránku "{title}".

Zadání webu od zákazníka:

\`\`\`
{assigment}
\`\`\`

## Pokyny:

-   Napiště seznam klíčových slov
-   Klíčové slova jsou v základním tvaru
-   Účelem webu je {purpose} 


## Příklad:

-   Zmrzlina
-   Olomouc
-   Kvalita
-   Rodina
-   Tradice
-   Itálie
-   Řemeslo
```

`-> {keywords}` Klíčová slova

## 🔗 Vytvoření začátku obsahu webu

-   Simple template

```text

# {title}

> {claim}

```

`-> {contentBeginning}` Začátek obsahu webu

## 🖋 Vytvoření obsahu webu

-   Use completion
<!-- TODO: [🌚]> -   Use GPT-3 -->

```markdown
Jako zkušenému copywriterovi a webdesignérovi vám bylo svěřeno vytvoření textu pro novou webovou stránku {title}.

Zadání webu od zákazníka:

\`\`\`
{assigment}
\`\`\`

## Pokyny:

-   Formátování textu je v Markdownu
-   Buďte struční a výstižní
-   Účelem webu je {purpose} 
-   Použijte klíčová slova, avšak ta mají být přirozeně v textu
-   Jedná se o kompletní obsah stránky, tedy nezapomeňte na všechny důležité informace a prvky, co by měla stránka obsahovat
-   Použijte nadpisy, odrážky, formátování textu

## Klíčová slova:

{keywords}

## Obsah webu:

{contentBeginning}
```

`-> {contentBody}` Stať obsahu webu

## 🔗 Spojení obsahu

-   Simple template

```markdown
{contentBeginning}

{contentBody}
```

`-> {content}`
