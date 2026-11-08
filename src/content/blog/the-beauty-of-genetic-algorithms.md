---
title: "The beauty of Genetic Algorithms"
date: "2026-09-07T02:20:44.000Z"
category: "Technology"
description: "A colleague once told me, when you have no idea how to solve a problem, you should use Genetic Algorithms. It is a class of algorithms that attempt to solve a…"
featured: true
source: "https://medium.com/@abhinai/the-beauty-of-genetic-algorithms-fde052d51677"
sourceName: "Medium"
weight: 2
---

A colleague once told me, when you have no idea how to solve a problem, you should use Genetic Algorithms. It is a class of algorithms that attempt to solve a problem by taking an inspiration from the process of natural selection.

The approach is very simple:

-   Represent the solution to a problem as a sequence of bits or numbers. (called **chromosomes** or **individuals)**
-   Generate an initial population of candidate solutions randomly.
-   Create a “fitness function” - A way to score how good an individual is.
-   Probabilistically pick the best solutions in the current population and combine them to create new solutions. Randomly flip some bits during this process to simulate the fact that offsprings are not an exact sum of their parents.
-   Repeat until we have a good solution.

It’s amazing that this works. Machine learning experts will be quick to point out that the entire process looks a lot like gradient descent with a bit of randomness. True.

I am beginning to see this algorithm everywhere in daily life. The key elements are:

-   Start with a random solution to any problem
-   Continuously improve upon the solution(s) you have.
-   Once in a while try something random. — This is very important because it prevents us from converging on a local maxima. Put other way, it allows us to discover new things we’d otherwise never try.

In investing if you follow the advice of “cut your losers and double down on your winners” then it’s a genetic algorithm. Momentum investing looks a lot like genetic algorithms.

Paul Graham once said “*Work in two phases. Phase-1: Allow yourself to make mistakes. Phase-2: Aggressively fix mistakes*” (approx. statement from my recollection). I found it to be a very powerful advice because the best way to learn about something is by doing it. But if you don’t know how to do it in the first place, you’re going to have to start somewhere — do it poorly and fail — but learn how to do it better in the process and then doing it right. And that right there is very similar to the GA approach.

I am going to actively adopt this in my everyday approach to solving problems.
