
import { Question } from './types';

export const STATIC_QUESTIONS: Question[] = [
  // --- Section I: Basics ---
  { id: '1', text: "What is Angular Framework?", category: "Basics" },
  { id: '2', text: "What is the difference between AngularJS and Angular?", category: "Basics" },
  { id: '3', text: "What is TypeScript?", category: "Basics" },
  { id: '4', text: "Write a pictorial diagram of Angular architecture?", category: "Basics" },
  { id: '5', text: "What are the key components of Angular?", category: "Architecture" },
  { id: '6', text: "What are directives?", category: "Basics" },
  { id: '7', text: "What are components?", category: "Basics" },
  { id: '8', text: "What are the differences between Component and Directive?", category: "Basics" },
  { id: '9', text: "What is a template?", category: "Basics" },
  { id: '10', text: "What is a module?", category: "Basics" },
  { id: '11', text: "What are the lifecycle hooks available?", category: "Lifecycle" },
  { id: '12', text: "What is data binding?", category: "Basics" },
  { id: '13', text: "What is metadata?", category: "Architecture" },
  { id: '14', text: "What is Angular CLI?", category: "Tooling" },
  { id: '15', text: "What is the difference between constructor and ngOnInit?", category: "Lifecycle" },
  { id: '16', text: "What is a service?", category: "Architecture" },
  { id: '17', text: "What is dependency injection in Angular?", category: "Architecture" },
  { id: '19', text: "What is the purpose of async pipe?", category: "Pipes" },
  { id: '21', text: "What is the purpose of *ngFor directive?", category: "Directives" },
  { id: '22', text: "What is the purpose of ngIf directive?", category: "Directives" },
  { id: '33', text: "What is the difference between pure and impure pipe?", category: "Pipes" },
  { id: '36', text: "What is HttpClient and its benefits?", category: "HTTP" },
  { id: '44', text: "What is the difference between promise and observable?", category: "RxJS" },
  { id: '63', text: "What is Angular Router?", category: "Routing" },
  { id: '111', text: "What is Angular Ivy?", category: "Advanced" },
  { id: '143', text: "What is lazy loading?", category: "Advanced" },

  // --- Section II: Architecture & APIs (Yonet) ---
  { id: 'y1', text: "What is a good use case for ngrx/store or ngrx/entity?", category: "Architecture" },
  { id: 'y2', text: "Can you talk about a bug related to a race condition, how to solve it and how to test it?", category: "Architecture" },
  { id: 'y3', text: "What is the difference between a smart/container component and a dumb/presentational component?", category: "Architecture" },
  { id: 'y4', text: "Why would you use renderer methods instead of native element methods?", category: "Advanced" },
  { id: 'y7', text: "How would you protect a component being activated through the router?", category: "Routing" },

  // --- Section III: Templates & Components ---
  { id: 't1', text: "What happens if you subscribe to a data source multiple times with async pipe?", category: "Templates" },
  { id: 't2', text: "What is the difference between ng-content, ng-container and ng-template?", category: "Templates" },
  { id: 't3', text: "Are you working with attributes or properties in data-binding?", category: "Templates" },

  // --- Section IV: Observables (RxJS) ---
  { id: 'r1', text: "What is the difference between an observable and a subject?", category: "RxJS" },
  { id: 'r2', text: "How would you implement multiple api calls that need to happen in order using rxjs?", category: "RxJS" },
  { id: 'r3', text: "What is the difference between switchMap, concatMap and mergeMap?", category: "RxJS" },
  { id: 'r4', text: "What is the difference between scan() vs reduce()?", category: "RxJS" },

  // --- Section V: Modern Challenges & Challenges ---
  { id: 'c1', text: "What is GraphQL and how does it compare to REST?", category: "Modern Tech" },
  { id: 'c2', text: "How would you recreate Angular's [(ngModel)] behavior in plain JavaScript?", category: "Challenges" },
  { id: 'c3', text: "What is the difference between readonly and const in TypeScript?", category: "TypeScript" },
  { id: 'c4', text: "What are XSS attacks, and how do you secure Angular apps from them?", category: "Security" },

  // --- Section VI: General JS/TS ---
  { id: 'g1', text: "Explain the difference between var, let and const.", category: "JavaScript" },
  { id: 'g2', text: "What is hoisting in JavaScript?", category: "JavaScript" },
  { id: 'g3', text: "What is a closure?", category: "JavaScript" },
  { id: 'g4', text: "What is memoization?", category: "JavaScript" }
];
