# Page snapshot

```yaml
- generic [active]:
  - alert [ref=e1]
  - dialog [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - heading "Build Error" [level=1] [ref=e7]
        - paragraph [ref=e8]: Failed to compile
        - generic [ref=e9]:
          - text: Next.js (14.2.5) is outdated
          - link "(learn more)" [ref=e11]:
            - /url: https://nextjs.org/docs/messages/version-staleness
      - generic [ref=e12]:
        - generic [ref=e13]:
          - link "app\\fonts.ts" [ref=e14] [cursor=pointer]:
            - text: app\fonts.ts
            - img [ref=e15]
          - generic [ref=e20]: "An error occurred in `next/font`. Error: [object Object] is not a PostCSS plugin at Processor.normalize (C:\\Users\\Mohamadou\\projects\\wallis-collection\\node_modules\\.pnpm\\postcss@8.4.31\\node_modules\\postcss\\lib\\processor.js:38:15) at new Processor (C:\\Users\\Mohamadou\\projects\\wallis-collection\\node_modules\\.pnpm\\postcss@8.4.31\\node_modules\\postcss\\lib\\processor.js:11:25) at postcss (C:\\Users\\Mohamadou\\projects\\wallis-collection\\node_modules\\.pnpm\\postcss@8.4.31\\node_modules\\postcss\\lib\\postcss.js:26:10) at C:\\Users\\Mohamadou\\projects\\wallis-collection\\node_modules\\.pnpm\\next@14.2.5_@babel+core@7.29.0_@opentelemetry+api@1.9.1_@playwright+test@1.58.2_react-dom@18._uezexggfolpyb7ssmk4kuixtdm\\node_modules\\next\\dist\\build\\webpack\\config\\blocks\\css\\index.js:127:37 at async C:\\Users\\Mohamadou\\projects\\wallis-collection\\node_modules\\.pnpm\\next@14.2.5_@babel+core@7.29.0_@opentelemetry+api@1.9.1_@playwright+test@1.58.2_react-dom@18._uezexggfolpyb7ssmk4kuixtdm\\node_modules\\next\\dist\\build\\webpack\\loaders\\next-font-loader\\index.js:86:33 at async Span.traceAsyncFn (C:\\Users\\Mohamadou\\projects\\wallis-collection\\node_modules\\.pnpm\\next@14.2.5_@babel+core@7.29.0_@opentelemetry+api@1.9.1_@playwright+test@1.58.2_react-dom@18._uezexggfolpyb7ssmk4kuixtdm\\node_modules\\next\\dist\\trace\\trace.js:154:20)"
        - contentinfo [ref=e21]:
          - paragraph [ref=e22]: This error occurred during the build process and can only be dismissed by fixing the error.
```