---
title: "The beauty of Cosine"
date: "2024-04-22T06:11:45.000Z"
category: "Technology"
description: "In the early 2000s, a new kind of search engine came along. It was called Vivisimo and it returned clustered search results. Having a machine cluster results…"
source: "https://medium.com/@abhinai/the-beauty-of-cosine-698bc3314ebe"
sourceName: "Medium"
weight: 2
---

In the early 2000s, a new kind of search engine came along. It was called Vivisimo and it returned clustered search results. Having a machine cluster results in a meaningful way was quite impressive.

Myself and a friend were determined to understand how it all worked. We worked separately to try and reproduce the beauty of Vivisimo. In the end both us got close. That’s when I first experienced the power of Cosine distance. My friend on the other hand landed on a novel approach of “Gravity” distance which re-purposed Newton’s formula for calculating the force of gravity between two bodies. Turns out, it was calculating the same thing as Cosine.

Since then I’ve used Cosine distance for a lot of things. I used it for text classification at Microsoft. The simplicity of (NN using) Cosine allowed me to focus on designing good features which then ended up making the end results better than SVM or Logistic Regression, the fashion of the day. Surprisingly, meany people made fun of me including some very smart research scientists from Microsoft Research. Except, they couldn’t beat my results.

I had no come back to people’s objections. Every research paper and study out there “proved” that SVM was the best classification approach. Cosine (NN) on the other hand was the “lowly” over simplified approach that couldn’t even be considered to be a valid classification algorithm. In the end, my algorithms were deployed because they were found to be most accurate.

Thankfully, these days with the advent of neural networks and RAG, I no longer have to spend energy convincing the world that there is something beautifully amazing about Cosine.
