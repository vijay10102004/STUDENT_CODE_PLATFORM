export const questions = [
  {
    id: '1',
    title: 'Print Hello World',
    description: 'Write a program that prints "Hello, World!"',
    defaultCode: {
      python: 'print("Hello, World!")',
      java: 'public class Main { public static void main(String[] args) { System.out.println("Hello, World!"); } }',
      cpp: '#include <iostream>\nint main() { std::cout << "Hello, World!"; return 0; }',
      c: '#include <stdio.h>\nint main() { printf("Hello, World!"); return 0; }'
    },
    testCases: [
      { input: "", expectedOutput: "Hello, World!" }
    ]
  }
];
