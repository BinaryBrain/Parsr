# Modules

- [Modules](#modules)
  - [1. Current Modules](#1-current-modules)
  - [2. Create your Module](#2-create-your-module)
    - [2.1. Create a New Typescript Module](#21-create-a-new-typescript-module)
    - [2.2. Add to Register](#22-add-to-register)
    - [2.3. Add it to the Configuration](#23-add-it-to-the-configuration)
    - [2.4. Run it!](#24-run-it)

Modules in Parsr perform a central role of cleaning and enriching the extracted raw output.
Each module performs a particular operation on a document representation, generates a new valid Document, and then passes it on to the next module for the next treatment.
Each module contains a set of configurable parameters, which can be consulted in the per-module documentation pages below:

## 1. Current Modules

1. [Header and Footer Detection](HeaderFooterDetectionModule/README.md)
2. [Heading Detection](HeadingDetectionModule/README.md)
3. [Hirarchy Detection](HierarchyDetectionModule/README.md)
4. [Key-Value Pair Detection](KeyValueDetectionModule/README.md)
5. [Lines to Paragraph](LinesToParagraphModule/README.md)
6. [Link Detection](LinkDetectionModule/README.md)
7. [List Detection](ListDetectionModule/README.md)
8. [Number Correction](NumberCorrectionModule/README.md)
9. [Out of Page Removal](OutOfPageRemovalModule/README.md)
10. [Page Number Detection](PageNumberDetectionModule/README.md)
11. [Reading Order Detection](ReadingOrderDetectionModule/README.md)
12. [Redundancy Detection](RedundancyDetectionModule/README.md)
13. [Regex Matcher](RegexMatcherModule/README.md)
14. [Seperate Words](SeparateWordsModule/README.md)
15. [Table Detection](TableDetectionModule/README.md)
16. [Whitespace Removal](WhitespaceRemovalModule/README.md)
17. [Words To Line](WordsToLineModule/README.md)

## 2. Create your Module

Creating a custom module can be very useful to add some treament on the document.

You have two way to do it:

1. Use the [Remote Module](RemoteModule/README.md) that will send the JSON by HTTP and expect the modified JSON as an answer
2. Create a Typescript Module and add it to the pipeline

### 2.1. Create a New Typescript Module

Create a new file in `/server/src/modules/` and name it accordingly.

You can copy the [template module file](TemplateModule/README.md) to help you having a boilerplate. It also contains some handy comments.

### 2.2. Add to Register

To add your newly created module to the register, simply open the [Cleaner file](../../server/src/Cleaner.ts) `/server/src/Cleaner.ts` and add your module class to the `Cleaner.cleaningToolRegister` attribute.

### 2.3. Add it to the Configuration

If you want your module to run you need to enable it in your [configuration](../../docs/configuration-file.md#3-Cleaner-Config).

Simply add a line in the `cleaner` array with the name of your module, and potential options.

### 2.4. Run it!

That's it! Your new awesome module should run and modify the document according to your needs!
