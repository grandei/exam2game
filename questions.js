/* ============================================================
   GAME CONTENT AND SETTINGS
   ------------------------------------------------------------
   HOW A ROUND WORKS
   - Teams take turns PICKING a square (the board shows whose pick).
   - EVERY team answers every clue on a whiteboard before time runs out.
   - Every correct team earns the points. The picking team gets a bonus.
   - Some squares hide a CARD (steal, swap, wheel spin...).

   WRITING CLUES
   - q:    the question. Wrap code in `backticks` for code font.
   - code: (optional) a multi-line program, shown with line numbers.
           Use \n between lines.
   - a:    the answer.  note: (optional) explanation under the answer.
   - Each category has two levels:
       challenge  the main game (harder)
       warmup     easier clues for a first review or a newer class
   - Each point value has a POOL. A new game picks one clue per value.
   - The game will not put two clues with the same code on one board
     (for example a "what's the output" and a "fill in the blank"
     built from the same line).
   - Some answers are `SyntaxError` on purpose. Others LOOK broken but
     run fine, so "SyntaxError" isn't a safe guess.
   ============================================================ */
const GAME = {
  title: "Unit 2 Review",
  teamCount: 7,
  categoriesPerGame: 4,            // columns on the board (Categories − / + changes it in class)
  level: "challenge",              // "challenge" or "warmup" (Level button changes it in class)

  // Seconds on the timer for each row. Harder rows get more time.
  timer: { 100: 15, 200: 20, 300: 30, 400: 40, 500: 45 },

  pickerBonus: 0.5,                // picking team earns +50% extra when they're right

  // CARDS: how many hidden card squares are on the board (Cards − / + changes it in class)
  cardsPerGame: 4,
  // How likely each card is when a card square is found. 0 turns a card off.
  cards: {
    steal: 3,         // right answer? take this clue's points from any team
    robinhood: 1,     // 1st place gives 300 to last place
    swap: 1,          // swap scores with a team within 500 points
    wager: 2,         // every team bets on this clue
    double: 2,        // double points, but wrong answers lose points
    shield: 2,        // blocks the next steal, swap, or freeze aimed at you
    freeze: 2,        // pick a team that can't score on this clue
    bounty: 2,        // if 1st place misses, every right team gets +200
    lightning: 1,     // 3 quick 100-point questions instead of this clue
    syntaxerror: 1,   // everyone loses 100 unless they yell "SyntaxError!" first
    rubberduck: 2,    // explain your answer out loud for +100
    mystery: 2,       // random.randint decides: -200 to +500
    wheel: 3          // spin the mini wheel
  },

  values: [100, 200, 300, 400, 500],
  categories: [

    // ======================== OPERATOR OVERLOAD ========================
    { name: "Operator Overload",
      challenge: {
        100: [
          { q: "What does `print(10 ** 0 + 10 // 3)` display?", a: "`4`", note: "10 ** 0 = 1 and 10 // 3 = 3, so 1 + 3." },
          { q: "What does `print(15 // 4 * 4)` display?", a: "`12`", note: "Left to right: 15 // 4 = 3, then 3 * 4 = 12. Not 15!" },
          { q: "What does `print(\"ha\" * 2 + \"ho\")` display?", a: "`hahaho`", note: "* repeats the string, then + joins: \"haha\" + \"ho\"." },
          { q: "After `a = 3`, then `b = a`, then `a = 10`, what is b?", a: "`3`", note: "b got a copy of the value 3. Changing a later doesn't change b." },
          { q: "What does `print(3 ** * 2)` display?", a: "`SyntaxError`", note: "** followed by * has nothing between them. (3 ** 2 alone would be 9.)" },
        ],
        200: [
          { q: "What does `print(-7 // 2)` display?", a: "`-4`", note: "// always rounds DOWN. -3.5 rounds down to -4, not -3!" },
          { q: "What does `print(2 ** 2 ** 3 // 10)` display?", a: "`25`", note: "Exponents go right to left: 2 ** 3 = 8, 2 ** 8 = 256, then 256 // 10 = 25." },
          { q: "What does `print(9 ** 0.5)` display?", a: "`3.0`", note: "A power of 0.5 is a square root, and the float makes the answer 3.0." },
          { q: "What does `print(1 / 2 ** 2 * 4)` display?", a: "`1.0`", note: "2 ** 2 = 4 first. Then left to right: 1 / 4 = 0.25, then 0.25 * 4 = 1.0." },
          { q: "After `x = 5`, then `x = x + x * x`, then `x = x // 4`, what is x?", a: "`7`", note: "5 + 25 = 30 is stored first. Then 30 // 4 = 7." },
          { q: "What does `print(6 // 4 * 4.0)` display? Careful!", a: "`4.0`", note: "Left to right: 6 // 4 = 1, then 1 * 4.0 = 4.0. Multiplying by a float makes a float." },
        ],
        300: [
          { q: "What is the output?", code: "x = 10\ny = -3\nz = 3\nprint(x + y * z)", a: "`1`", note: "y * z = -9 happens first, then 10 + (-9)." },
          { q: "What is the output?", code: "a = 17\nb = 5\nprint(a // b, a / b)", a: "`3 3.4`", note: "// drops the remainder (3). / keeps the decimal (3.4)." },
          { q: "What is the output?", code: "n = 7\nn = n * 2 - 3\nn = n // 2\nprint(n)", a: "`5`", note: "7 * 2 - 3 = 11, then 11 // 2 = 5." },
        ],
        400: [
          { q: "What is the output?", code: "x = 9\ny = 2\nprint(x ** y // x * y)", a: "`18`", note: "Exponent first: 81. Then left to right: 81 // 9 = 9, then 9 * 2 = 18." },
          { q: "What is the output?", code: "a = 2\nb = 3\na = a ** b\nb = a // b\nprint(a - b)", a: "`6`", note: "a becomes 8. Then b = 8 // 3 = 2. Finally 8 − 2." },
          { q: "What is the output?", code: "p = 7.0\nq = 2\nprint(p // q, p / q, p * q)", a: "`3.0 3.5 14.0`", note: "p is a float, so every result is a float, even the // one." },
        ],
        500: [
          { q: "What is the output?", code: "x = 5\ny = -2\nprint(x // y, x * y ** 2)", a: "`-3 20`", note: "5 // -2 is -2.5 rounded DOWN to -3. Then y ** 2 = 4 happens before *, so 5 * 4 = 20." },
          { q: "What is the output?", code: "a = 4\nb = a\na = a * b - b\nb = b ** 2 // a\nprint(a, b)", a: "`12 1`", note: "a = 16 − 4 = 12. Then b = 16 // 12 = 1." },
          { q: "What is the output?", code: "s = \"ab\"\nn = 3\nprint(s * n + s * (n - 2) * 2)", a: "`ababababab`", note: "\"ab\" * 3 = \"ababab\". Then \"ab\" * 1 * 2 = \"abab\". Joined: 10 letters." },
        ],
      },
      warmup: {
        100: [
          { q: "The `=` in `x = 5` does this: it stores a value in a variable.", a: "Assignment" },
          { q: "What does `print(9 - 12)` display?", a: "`-3`" },
          { q: "What does `print(5 * 4)` display?", a: "`20`" },
          { q: "This operator multiplies two numbers.", a: "`*`" },
        ],
        200: [
          { q: "What does `print(7 / 2)` display?", a: "`3.5`", note: "/ is regular division, so it keeps the decimal." },
          { q: "What does `print(3 * 4.0)` display?", a: "`12.0`", note: "An int times a float gives a float." },
          { q: "What does `print(9 // 2)` display?", a: "`4`", note: "9 / 2 is 4.5, and // drops the .5." },
          { q: "What does `print(2 ** 5)` display?", a: "`32`", note: "2 × 2 × 2 × 2 × 2" },
          { q: "What does `print(7 // / 2)` display?", a: "`SyntaxError`", note: "Two operators in a row with nothing between them. Python can't read it." },
        ],
        300: [
          { q: "What does `print(10 / 4 * 2)` display?", a: "`5.0`", note: "Left to right: 10 / 4 = 2.5, then 2.5 * 2 = 5.0. Still a float." },
          { q: "What does `print(7.0 // 2)` display?", a: "`3.0`", note: "Floor division with a float gives a float." },
          { q: "What does `print(2 ** 3 + 2 * 3)` display?", a: "`14`", note: "2 ** 3 = 8 and 2 * 3 = 6, then 8 + 6." },
          { q: "After `x = 4` and then `x = x ** 2 - x`, what is x?", a: "`12`", note: "The right side runs first with the OLD x: 16 − 4 = 12. Then 12 is stored in x." },
        ],
        400: [
          { q: "What does `print(10 ** 0 + 10 // 3)` display?", a: "`4`", note: "10 ** 0 = 1 and 10 // 3 = 3, so 1 + 3." },
          { q: "What does `print(15 // 4 * 4)` display?", a: "`12`", note: "Left to right: 15 // 4 = 3, then 3 * 4 = 12. Not 15!" },
          { q: "What does `print(\"ha\" * 2 + \"ho\")` display?", a: "`hahaho`", note: "* repeats the string, then + joins: \"haha\" + \"ho\"." },
          { q: "After `a = 3`, then `b = a`, then `a = 10`, what is b?", a: "`3`", note: "b got a copy of the value 3. Changing a later doesn't change b." },
          { q: "What does `print(3 ** * 2)` display?", a: "`SyntaxError`", note: "** followed by * has nothing between them. (3 ** 2 alone would be 9.)" },
        ],
        500: [
          { q: "What does `print(-7 // 2)` display?", a: "`-4`", note: "// always rounds DOWN. -3.5 rounds down to -4, not -3!" },
          { q: "What does `print(2 ** 2 ** 3 // 10)` display?", a: "`25`", note: "Exponents go right to left: 2 ** 3 = 8, 2 ** 8 = 256, then 256 // 10 = 25." },
          { q: "What does `print(9 ** 0.5)` display?", a: "`3.0`", note: "A power of 0.5 is a square root, and the float makes the answer 3.0." },
          { q: "What does `print(1 / 2 ** 2 * 4)` display?", a: "`1.0`", note: "2 ** 2 = 4 first. Then left to right: 1 / 4 = 0.25, then 0.25 * 4 = 1.0." },
          { q: "After `x = 5`, then `x = x + x * x`, then `x = x // 4`, what is x?", a: "`7`", note: "5 + 25 = 30 is stored first. Then 30 // 4 = 7." },
          { q: "What does `print(6 // 4 * 4.0)` display? Careful!", a: "`4.0`", note: "Left to right: 6 // 4 = 1, then 1 * 4.0 = 4.0. Multiplying by a float makes a float." },
        ],
      },
    },

    // ======================== MODULUS MAYHEM ========================
    { name: "Modulus Mayhem",
      challenge: {
        100: [
          { q: "What does `print(17 % 5 * 2)` display?", a: "`4`", note: "% and * have the same priority, so left to right: 17 % 5 = 2, then 2 * 2." },
          { q: "What does `print(10 + 7 % 3)` display?", a: "`11`", note: "% happens before +: 7 % 3 = 1, then 10 + 1." },
          { q: "What does `print(2 ** 3 % 5)` display?", a: "`3`", note: "** happens before %: 2 ** 3 = 8, then 8 % 5 = 3." },
          { q: "What does `print(7.5 % 2)` display?", a: "`1.5`", note: "2 × 3 = 6, and 7.5 − 6 = 1.5. % works with decimals too." },
        ],
        200: [
          { q: "What does `print(-7 % 3)` display?", a: "`2`", note: "In Python, the answer takes the sign of the number you divide by. -7 = 3 × (-3) + 2." },
          { q: "What does `print(17 % 5 % 3)` display?", a: "`2`", note: "Left to right: 17 % 5 = 2, then 2 % 3 = 2." },
          { q: "What does `print((10 % 4) ** 2 % 3)` display?", a: "`1`", note: "10 % 4 = 2, then 2 ** 2 = 4, then 4 % 3 = 1." },
          { q: "What does `print(1234 % 100)` display?", a: "`34`", note: "% 100 gives the last TWO digits." },
          { q: "For which of these numbers does `n % 3` give `0`? 7, 9, 12, 14", a: "9 and 12", note: "Both divide evenly by 3, so there's no remainder." },
          { q: "`print(17 % (5 - 5))`: SyntaxError, or an error when it runs?", a: "An error when it runs (`ZeroDivisionError`)", note: "The code is written correctly, so it's NOT a syntax error. It fails when it tries to divide by 5 − 5 = 0." },
        ],
        300: [
          { q: "What is the output?", code: "total = 47\nprint(total // 10, total % 10)", a: "`4 7`", note: "// 10 gives the tens digit, % 10 gives the ones digit." },
          { q: "What is the output?", code: "x = 23\ny = 4\nprint(x % y + x // y)", a: "`8`", note: "23 % 4 = 3 and 23 // 4 = 5, so 3 + 5." },
          { q: "What is the output?", code: "minutes = 135\nprint(minutes // 60, minutes % 60)", a: "`2 15`", note: "135 minutes is 2 full hours with 15 minutes left over." },
        ],
        400: [
          { q: "What is the output?", code: "n = 58\na = n % 10\nb = n // 10\nprint(a * 10 + b)", a: "`85`", note: "a = 8 and b = 5, so this reverses the digits: 8 * 10 + 5." },
          { q: "What is the output?", code: "x = -7\nprint(x % 4, x // 4)", a: "`1 -2`", note: "-7 // 4 rounds DOWN to -2. Then -7 = 4 × (-2) + 1, so the remainder is 1." },
          { q: "What whole number n from 20 to 30 gives `2` for `n % 7`, and also gives `0` for `n % 3`?", a: "`30`", note: "30 % 7 = 2 and 30 % 3 = 0. It's the only one that works." },
        ],
        500: [
          { q: "What is the output?", code: "secs = 3725\nh = secs // 3600\nm = secs % 3600 // 60\ns = secs % 60\nprint(h, m, s)", a: "`1 2 5`", note: "3725 seconds = 1 hour (3600), with 125 left. 125 // 60 = 2 minutes, and 3725 % 60 = 5 seconds." },
          { q: "What is the output?", code: "x = 10\nx = x % 4 * x % 3\nprint(x)", a: "`2`", note: "Left to right: 10 % 4 = 2, 2 * 10 = 20, 20 % 3 = 2." },
          { q: "Give a positive whole number n that makes this print `5`.", code: "print(n // 4 + n % 4)", a: "Any of `11`, `14`, `17`, or `20`", note: "Example: 11 // 4 = 2 and 11 % 4 = 3, and 2 + 3 = 5." },
        ],
      },
      warmup: {
        100: [
          { q: "What does `print(4 % 2)` display?", a: "`0`", note: "4 divides evenly by 2, so nothing is left over." },
          { q: "What does `print(6 % 3)` display?", a: "`0`", note: "6 divides evenly by 3." },
          { q: "What does `print(5 % 2)` display?", a: "`1`", note: "5 ÷ 2 = 2 with 1 left over." },
          { q: "The `%` operator gives you the ___ of a division.", a: "The remainder" },
        ],
        200: [
          { q: "What does `print(11 % 4)` display?", a: "`3`", note: "4 × 2 = 8, and 11 − 8 = 3." },
          { q: "What does `print(9 % 5)` display?", a: "`4`", note: "5 × 1 = 5, and 9 − 5 = 4." },
          { q: "What does `print(8 % 10)` display?", a: "`8`", note: "10 doesn't fit into 8, so all of 8 is left over." },
          { q: "What does `print(20 % 6)` display?", a: "`2`", note: "6 × 3 = 18, and 20 − 18 = 2." },
        ],
        300: [
          { q: "What does `print(3 % 8)` display?", a: "`3`", note: "When the first number is smaller, you get it right back." },
          { q: "What does `print(100 % 7)` display?", a: "`2`", note: "7 × 14 = 98, and 100 − 98 = 2." },
          { q: "What does `print(15 % 4 + 1)` display?", a: "`4`", note: "% happens before +: 15 % 4 = 3, then 3 + 1." },
          { q: "What does `print(0 % 5)` display?", a: "`0`", note: "0 divided by anything leaves nothing over." },
          { q: "What does `print(10 % % 3)` display?", a: "`SyntaxError`", note: "Two % signs in a row with nothing between them." },
        ],
        400: [
          { q: "What does `print(17 % 5 * 2)` display?", a: "`4`", note: "% and * have the same priority, so left to right: 17 % 5 = 2, then 2 * 2." },
          { q: "What does `print(10 + 7 % 3)` display?", a: "`11`", note: "% happens before +: 7 % 3 = 1, then 10 + 1." },
          { q: "What does `print(2 ** 3 % 5)` display?", a: "`3`", note: "** happens before %: 2 ** 3 = 8, then 8 % 5 = 3." },
          { q: "What does `print(7.5 % 2)` display?", a: "`1.5`", note: "2 × 3 = 6, and 7.5 − 6 = 1.5. % works with decimals too." },
        ],
        500: [
          { q: "What does `print(-7 % 3)` display?", a: "`2`", note: "In Python, the answer takes the sign of the number you divide by. -7 = 3 × (-3) + 2." },
          { q: "What does `print(17 % 5 % 3)` display?", a: "`2`", note: "Left to right: 17 % 5 = 2, then 2 % 3 = 2." },
          { q: "What does `print((10 % 4) ** 2 % 3)` display?", a: "`1`", note: "10 % 4 = 2, then 2 ** 2 = 4, then 4 % 3 = 1." },
          { q: "What does `print(1234 % 100)` display?", a: "`34`", note: "% 100 gives the last TWO digits." },
          { q: "For which of these numbers does `n % 3` give `0`? 7, 9, 12, 14", a: "9 and 12", note: "Both divide evenly by 3, so there's no remainder." },
          { q: "`print(17 % (5 - 5))`: SyntaxError, or an error when it runs?", a: "An error when it runs (`ZeroDivisionError`)", note: "The code is written correctly, so it's NOT a syntax error. It fails when it tries to divide by 5 − 5 = 0." },
        ],
      },
    },

    // ======================== PEMDAS PANIC ========================
    { name: "PEMDAS Panic",
      challenge: {
        100: [
          { q: "What does `print(10 - 4 - 3)` display?", a: "`3`", note: "Left to right: 10 − 4 = 6, then 6 − 3." },
          { q: "What does `print(-3 ** 2)` display?", a: "`-9`", note: "The exponent happens before the minus sign: -(3 ** 2)." },
          { q: "What does `print(100 // 10 % 3)` display?", a: "`1`", note: "Left to right: 100 // 10 = 10, then 10 % 3 = 1." },
          { q: "This line should average three scores: `avg = 85 + 90 + 78 / 3`. What's wrong, and how do you fix it?", a: "Only 78 gets divided. Fix: `(85 + 90 + 78) / 3`", note: "Without parentheses it gives 201.0 instead of about 84.33." },
          { q: "What does `print((2 + 3 * 4)` display?", a: "`SyntaxError`", note: "Count them: 2 opening ( but only 1 closing )." },
        ],
        200: [
          { q: "What does `print(2 ** 3 ** 2)` display?", a: "`512`", note: "Exponents go right to left: 3 ** 2 = 9, then 2 ** 9 = 512." },
          { q: "What does `print(6 / 2 * (1 + 2))` display?", a: "`9.0`", note: "Parentheses: 3. Then LEFT TO RIGHT: 6 / 2 = 3.0, then 3.0 * 3 = 9.0. Not 1!" },
          { q: "What does `print(5 + 10 // 3 * 2 ** 2)` display?", a: "`17`", note: "2 ** 2 = 4. Then left to right: 10 // 3 = 3, 3 * 4 = 12. Last, 5 + 12." },
          { q: "What does `print((8 - 3 * 2) ** 3 / 4)` display?", a: "`2.0`", note: "Inside first: 3 * 2 = 6, 8 − 6 = 2. Then 2 ** 3 = 8, and 8 / 4 = 2.0." },
          { q: "What does `print(-2 ** 2 + (-2) ** 2)` display?", a: "`0`", note: "-2 ** 2 means -(2 ** 2) = -4, but (-2) ** 2 = 4. So -4 + 4 = 0." },
          { q: "What does `print(2(3 + 4))` display?", a: "An error! Python needs `2 * (3 + 4)`", note: "In math class 2(3 + 4) means multiply, but Python needs the *. (Technically it's a TypeError: Python thinks you're trying to use 2 like a function.)" },
        ],
        300: [
          { q: "What is the output?", code: "a = 6\nb = 2\nc = 3\nprint(a / b * c)", a: "`9.0`", note: "Same priority, so left to right: 6 / 2 = 3.0, then 3.0 * 3." },
          { q: "What is the output?", code: "x = 4\nprint(x + x * x - x / x)", a: "`19.0`", note: "x * x = 16 and x / x = 1.0 first. Then 4 + 16 − 1.0." },
          { q: "What is the output?", code: "a = 2\nb = 5\nprint((a + b) * a ** 2)", a: "`28`", note: "Parentheses: 7. Exponent: 4. Then 7 * 4." },
        ],
        400: [
          { q: "What is the output?", code: "a = 8\nb = 3\nprint(a - b * 2 ** 2 + a % b)", a: "`-2`", note: "2 ** 2 = 4, then 3 * 4 = 12 and 8 % 3 = 2. Last, 8 − 12 + 2." },
          { q: "What is the output?", code: "x = 3\ny = 2\nprint(-x ** y + (x - y) ** x)", a: "`-8`", note: "-x ** y means -(3 ** 2) = -9. (3 − 2) ** 3 = 1. So -9 + 1." },
          { q: "What is the output?", code: "a = 10\nb = 4\nprint(a // b ** 2 * 3)", a: "`0`", note: "b ** 2 = 16 first. 10 // 16 = 0, and 0 * 3 = 0." },
        ],
        500: [
          { q: "What is the output?", code: "a = 2\nb = 3\nc = 4\nprint(a ** b ** a // c % b)", a: "`2`", note: "Exponents right to left: 3 ** 2 = 9, 2 ** 9 = 512. Then 512 // 4 = 128, and 128 % 3 = 2." },
          { q: "What is the output?", code: "x = 12\ny = 5\nprint(x - y - (x - y) * 2 / y)", a: "`4.2`", note: "(12 − 5) * 2 / 5 = 2.8. Then left to right: 12 − 5 = 7, and 7 − 2.8 = 4.2." },
          { q: "What is the output?", code: "a = 5\nb = -2\nprint(a * b ** 2 - a // b + a % b)", a: "`22`", note: "b ** 2 = 4, so 5 * 4 = 20. 5 // -2 = -3 and 5 % -2 = -1. So 20 − (-3) + (-1)." },
        ],
      },
      warmup: {
        100: [
          { q: "What does `print((3 + 4) * 2)` display?", a: "`14`", note: "Parentheses first: 7 * 2." },
          { q: "What does `print((2 + 3) * 4)` display?", a: "`20`", note: "Parentheses first: 5 * 4." },
          { q: "What does `print(2 + 3 * 4)` display?", a: "`14`", note: "Multiplication first: 3 * 4 = 12, then 2 + 12." },
          { q: "In PEMDAS, what does the P stand for?", a: "Parentheses" },
        ],
        200: [
          { q: "What does `print(10 - 2 * 3)` display?", a: "`4`", note: "2 * 3 = 6 first, then 10 − 6." },
          { q: "What does `print((10 - 2) * 3)` display?", a: "`24`", note: "Parentheses first: 8 * 3." },
          { q: "What does `print(8 / 2 + 2)` display?", a: "`6.0`", note: "8 / 2 = 4.0 first, then + 2. The / makes it a float." },
          { q: "What does `print(20 - 6 / 2)` display?", a: "`17.0`", note: "Division first: 6 / 2 = 3.0, then 20 − 3.0." },
        ],
        300: [
          { q: "What does `print(2 * 3 ** 2)` display?", a: "`18`", note: "Exponent first: 3 ** 2 = 9, then 2 * 9." },
          { q: "What does `print((2 * 3) ** 2)` display?", a: "`36`", note: "Parentheses first: 6 ** 2." },
          { q: "What does `print(12 / 4 * 3)` display?", a: "`9.0`", note: "Same priority, so left to right: 12 / 4 = 3.0, then 3.0 * 3." },
          { q: "What does `print(3 + 4 * 2 ** 2)` display?", a: "`19`", note: "Exponent first (2 ** 2 = 4), then 4 * 4 = 16, then 3 + 16." },
          { q: "What does `print((2 + 3) * 4))` display?", a: "`SyntaxError`", note: "There's one extra ) at the end. Every ( needs exactly one )." },
        ],
        400: [
          { q: "What does `print(10 - 4 - 3)` display?", a: "`3`", note: "Left to right: 10 − 4 = 6, then 6 − 3." },
          { q: "What does `print(-3 ** 2)` display?", a: "`-9`", note: "The exponent happens before the minus sign: -(3 ** 2)." },
          { q: "What does `print(100 // 10 % 3)` display?", a: "`1`", note: "Left to right: 100 // 10 = 10, then 10 % 3 = 1." },
          { q: "This line should average three scores: `avg = 85 + 90 + 78 / 3`. What's wrong, and how do you fix it?", a: "Only 78 gets divided. Fix: `(85 + 90 + 78) / 3`", note: "Without parentheses it gives 201.0 instead of about 84.33." },
          { q: "What does `print((2 + 3 * 4)` display?", a: "`SyntaxError`", note: "Count them: 2 opening ( but only 1 closing )." },
        ],
        500: [
          { q: "What does `print(2 ** 3 ** 2)` display?", a: "`512`", note: "Exponents go right to left: 3 ** 2 = 9, then 2 ** 9 = 512." },
          { q: "What does `print(6 / 2 * (1 + 2))` display?", a: "`9.0`", note: "Parentheses: 3. Then LEFT TO RIGHT: 6 / 2 = 3.0, then 3.0 * 3 = 9.0. Not 1!" },
          { q: "What does `print(5 + 10 // 3 * 2 ** 2)` display?", a: "`17`", note: "2 ** 2 = 4. Then left to right: 10 // 3 = 3, 3 * 4 = 12. Last, 5 + 12." },
          { q: "What does `print((8 - 3 * 2) ** 3 / 4)` display?", a: "`2.0`", note: "Inside first: 3 * 2 = 6, 8 − 6 = 2. Then 2 ** 3 = 8, and 8 / 4 = 2.0." },
          { q: "What does `print(-2 ** 2 + (-2) ** 2)` display?", a: "`0`", note: "-2 ** 2 means -(2 ** 2) = -4, but (-2) ** 2 = 4. So -4 + 4 = 0." },
          { q: "What does `print(2(3 + 4))` display?", a: "An error! Python needs `2 * (3 + 4)`", note: "In math class 2(3 + 4) means multiply, but Python needs the *. (Technically it's a TypeError: Python thinks you're trying to use 2 like a function.)" },
        ],
      },
    },

    // ======================== MODULES & METHODS ========================
    { name: "Modules & Methods",
      challenge: {
        100: [
          { q: "What does `print(int(math.sqrt(49)))` display?", a: "`7`", note: "math.sqrt gives 7.0, and int() turns it into 7." },
          { q: "What does `print(math.fabs(3 - 10))` display?", a: "`7.0`", note: "3 − 10 = -7, and fabs makes it 7.0." },
          { q: "Write a line of code that rolls a 20-sided die.", a: "`random.randint(1, 20)`" },
          { q: "Can `random.random()` ever return exactly `1.0`?", a: "No", note: "It returns 0.0 up to, but not including, 1.0." },
        ],
        200: [
          { q: "What does `print(math.sqrt(math.pow(3, 2) + math.pow(4, 2)))` display?", a: "`5.0`", note: "9.0 + 16.0 = 25.0, and the square root is 5.0." },
          { q: "What does `print(math.pow(2, 3) // 3)` display?", a: "`2.0`", note: "math.pow gives 8.0, and 8.0 // 3 = 2.0. A float stays a float." },
          { q: "What does `print(int(math.fabs(-7.9)))` display?", a: "`7`", note: "fabs gives 7.9, then int() chops off the decimal. It does not round!" },
          { q: "What does `print(math.sqrt(16) ** 2 % 5)` display?", a: "`1.0`", note: "4.0 ** 2 = 16.0, then 16.0 % 5 = 1.0." },
          { q: "What are the smallest and largest possible results of `random.randint(1, 6) + random.randint(1, 6)`?", a: "2 and 12", note: "The smallest is 1 + 1, and the largest is 6 + 6." },
          { q: "Write ONE line using `random` that gives a random EVEN number from 2 to 20.", a: "`random.randint(1, 10) * 2`", note: "Any whole number times 2 is even. Other correct answers work too!" },
          { q: "`print(math.sqrt(-16))`: SyntaxError, or an error when it runs?", a: "An error when it runs (`ValueError`)", note: "The code is written correctly. It fails because math.sqrt can't take the square root of a negative number." },
        ],
        300: [
          { q: "What is the output?", code: "import math\nx = math.sqrt(36)\ny = math.pow(2, 3)\nprint(x + y)", a: "`14.0`", note: "6.0 + 8.0. Both math methods return floats." },
          { q: "What is the output?", code: "import math\na = -9\nprint(math.fabs(a) + math.sqrt(math.fabs(a)))", a: "`12.0`", note: "fabs(-9) = 9.0 and sqrt(9.0) = 3.0." },
          { q: "Write ONE line that prints a random whole number from 50 to 100 (both included).", a: "`print(random.randint(50, 100))`", note: "randint includes both endpoints. (random must be imported first.)" },
        ],
        400: [
          { q: "What is the output?", code: "import math\nn = 2\nn = math.pow(n, 3)\nn = math.sqrt(n * 2)\nprint(n, n // 3)", a: "`4.0 1.0`", note: "pow gives 8.0, then sqrt(16.0) = 4.0. A float with // stays a float: 1.0." },
          { q: "Write ONE line that prints a random multiple of 5 from 5 to 50.", a: "`print(random.randint(1, 10) * 5)`", note: "Other correct answers work too, like random.choice with a list of all 10 multiples." },
          { q: "What is the output?", code: "import math\na = 3\nb = 4\nc = math.sqrt(a ** 2 + b ** 2)\nprint(int(c) * 2, c * 2)", a: "`10 10.0`", note: "c = sqrt(25) = 5.0. int(c) * 2 is 10, but c * 2 stays a float." },
        ],
        500: [
          { q: "What is the output?", code: "import math\nx = math.fabs(-10) // 3\ny = math.pow(x, 2) % 5\nprint(x, y)", a: "`3.0 4.0`", note: "10.0 // 3 = 3.0. Then 3.0 ** 2 = 9.0, and 9.0 % 5 = 4.0." },
          { q: "Write ONE line that prints either `1` or `-1` at random, and nothing else.", a: "`print(random.choice([1, -1]))`", note: "Another way: print(random.randint(0, 1) * 2 - 1)" },
          { q: "What is the output? Careful!", code: "import random\nimport math\nn = random.randint(4, 4)\nprint(math.sqrt(n) ** 3)", a: "`8.0`", note: "randint(4, 4) can only return 4. sqrt(4) = 2.0, and 2.0 ** 3 = 8.0." },
        ],
      },
      warmup: {
        100: [
          { q: "The line you must write before you can use `math.sqrt()`.", a: "`import math`", note: "A module must be imported before its methods can be used." },
          { q: "A file of pre-written Python code that you can import is called a ___.", a: "A module" },
          { q: "The keyword used to bring a module into your program.", a: "`import`" },
          { q: "Which module contains `randint()`?", a: "`random`" },
        ],
        200: [
          { q: "What does `print(math.sqrt(25))` display?", a: "`5.0`", note: "math methods return floats." },
          { q: "What does `print(math.pow(3, 2))` display?", a: "`9.0`", note: "math.pow always returns a float." },
          { q: "What does `print(math.fabs(4))` display?", a: "`4.0`", note: "fabs returns a float, even for a positive number." },
          { q: "List every value `random.randint(1, 6)` could return.", a: "1, 2, 3, 4, 5, or 6", note: "randint includes BOTH endpoints." },
          { q: "What does `print(math.sqrt(16)` display?", a: "`SyntaxError`", note: "Two ( but only one ). Every ( needs a matching )." },
        ],
        300: [
          { q: "What does `print(math.fabs(-2.5))` display?", a: "`2.5`", note: "fabs gives the absolute value: the distance from 0." },
          { q: "What does `print(math.pow(10, 0))` display?", a: "`1.0`", note: "Anything to the power of 0 is 1, and math.pow makes it a float." },
          { q: "What does `print(math.sqrt(16) + 1)` display?", a: "`5.0`", note: "math.sqrt(16) is 4.0, so the answer stays a float." },
          { q: "With `import math` at the top, why does `sqrt(9)` cause an error?", a: "You need `math.sqrt(9)`", note: "Methods from a module must start with the module name." },
          { q: "What does `print(random.randint(1 6))` display?", a: "`SyntaxError`", note: "The comma between 1 and 6 is missing." },
        ],
        400: [
          { q: "What does `print(int(math.sqrt(49)))` display?", a: "`7`", note: "math.sqrt gives 7.0, and int() turns it into 7." },
          { q: "What does `print(math.fabs(3 - 10))` display?", a: "`7.0`", note: "3 − 10 = -7, and fabs makes it 7.0." },
          { q: "Write a line of code that rolls a 20-sided die.", a: "`random.randint(1, 20)`" },
          { q: "Can `random.random()` ever return exactly `1.0`?", a: "No", note: "It returns 0.0 up to, but not including, 1.0." },
        ],
        500: [
          { q: "What does `print(math.sqrt(math.pow(3, 2) + math.pow(4, 2)))` display?", a: "`5.0`", note: "9.0 + 16.0 = 25.0, and the square root is 5.0." },
          { q: "What does `print(math.pow(2, 3) // 3)` display?", a: "`2.0`", note: "math.pow gives 8.0, and 8.0 // 3 = 2.0. A float stays a float." },
          { q: "What does `print(int(math.fabs(-7.9)))` display?", a: "`7`", note: "fabs gives 7.9, then int() chops off the decimal. It does not round!" },
          { q: "What does `print(math.sqrt(16) ** 2 % 5)` display?", a: "`1.0`", note: "4.0 ** 2 = 16.0, then 16.0 % 5 = 1.0." },
          { q: "What are the smallest and largest possible results of `random.randint(1, 6) + random.randint(1, 6)`?", a: "2 and 12", note: "The smallest is 1 + 1, and the largest is 6 + 6." },
          { q: "Write ONE line using `random` that gives a random EVEN number from 2 to 20.", a: "`random.randint(1, 10) * 2`", note: "Any whole number times 2 is even. Other correct answers work too!" },
          { q: "`print(math.sqrt(-16))`: SyntaxError, or an error when it runs?", a: "An error when it runs (`ValueError`)", note: "The code is written correctly. It fails because math.sqrt can't take the square root of a negative number." },
        ],
      },
    },

    // ======================== TYPE TWISTER ========================
    { name: "Type Twister",
      challenge: {
        100: [
          { q: "`age = input(\"Age? \")` and then `age + 1` causes an error. Why?", a: "`input()` returns a string, and you can't add a string and a number", note: "Fix: `age = int(input(\"Age? \"))`" },
          { q: "What does `print(str(2 + 3) + \"0\")` display?", a: "`50`", note: "2 + 3 = 5 first, then str turns it into \"5\" and joins \"0\"." },
          { q: "What does `print(int(float(\"4.7\")))` display?", a: "`4`", note: "float(\"4.7\") gives 4.7, then int() chops it to 4." },
          { q: "What does `print(float(3) + int(2.9))` display?", a: "`5.0`", note: "int(2.9) drops the decimal, giving 2. Then 3.0 + 2 = 5.0." },
          { q: "`print(\"5\" + 5)`: SyntaxError, or an error when it runs?", a: "An error when it runs (`TypeError`)", note: "The code is written correctly. It fails when Python tries to join a string and a number." },
        ],
        200: [
          { q: "What happens when Python runs `int(\"4.7\")`?", a: "An error (ValueError)", note: "int() can't read a decimal string. Use int(float(\"4.7\")) instead." },
          { q: "What does `print(str(1 + 1) * 3)` display?", a: "`222`", note: "1 + 1 = 2, str makes it \"2\", and * 3 repeats it." },
          { q: "What does `print(int(\"1\" + \"2\") * 2)` display?", a: "`24`", note: "\"1\" + \"2\" joins into \"12\", int makes it 12, then 12 * 2." },
          { q: "What does `print(str(int(9.9)) + str(9 // 2))` display?", a: "`94`", note: "int(9.9) = 9 and 9 // 2 = 4. As strings, \"9\" + \"4\" joins them." },
          { q: "`x = input()` and the user types `5`. What does `print(x * 3)` display?", a: "`555`", note: "x is the STRING \"5\", so * 3 repeats it instead of multiplying." },
          { q: "What does `print(int(\"5\") \"5\")` display?", a: "`SyntaxError`", note: "There's no operator between int(\"5\") and \"5\", so Python can't tell what to do with them." },
        ],
        300: [
          { q: "What is the output?", code: "a = \"4\"\nb = 4\nprint(a * b, int(a) * b)", a: "`4444 16`", note: "A string times 4 repeats it. int(\"4\") * 4 is real multiplication." },
          { q: "The user types `6`. What is the output?", code: "x = input()\nprint(x + x, int(x) + int(x))", a: "`66 12`", note: "input() gives the string \"6\", so x + x joins. int() makes real numbers." },
          { q: "What is the output?", code: "n = 7.9\nm = int(n)\nprint(m, float(m), str(m) + \"9\")", a: "`7 7.0 79`", note: "int chops 7.9 to 7. float(7) = 7.0. str(7) + \"9\" joins to \"79\"." },
        ],
        400: [
          { q: "The user types `15`. What is the output?", code: "age = int(input())\nprint(str(age // 4) + str(age % 4))", a: "`33`", note: "15 // 4 = 3 and 15 % 4 = 3. As strings, \"3\" + \"3\" joins them." },
          { q: "What is the output?", code: "a = \"12\"\nb = \"3\"\nprint(int(a + b) // int(b), a * int(b))", a: "`41 121212`", note: "a + b joins to \"123\", and 123 // 3 = 41. Then \"12\" * 3 repeats." },
          { q: "What is the output?", code: "x = float(\"2.5\")\ny = int(x * 3)\nprint(x * 3, y, str(y) * 2)", a: "`7.5 7 77`", note: "x * 3 = 7.5. int chops it to 7. \"7\" * 2 = \"77\"." },
        ],
        500: [
          { q: "The user types `9`. What is the output?", code: "n = input()\nprint(int(n * 2) // 9 + float(n))", a: "`20.0`", note: "n is the string \"9\", so n * 2 = \"99\". 99 // 9 = 11, plus 9.0." },
          { q: "What is the output?", code: "a = 5\nb = str(a) + str(a * 2)\nc = int(b) % 7\nprint(b, c)", a: "`510 6`", note: "b joins \"5\" and \"10\" into \"510\". 510 % 7 = 6." },
          { q: "What is the output?", code: "x = \"3\"\ny = int(x) ** 2\nz = str(y) * int(x)\nprint(int(z) // 1000)", a: "`0`", note: "y = 9. z = \"9\" * 3 = \"999\". 999 // 1000 = 0." },
        ],
      },
      warmup: {
        100: [
          { q: "This built-in function displays output on the screen.", a: "`print()`" },
          { q: "This built-in function gets text typed in by the user.", a: "`input()`" },
          { q: "This built-in function turns `\"42\"` into the number `42`.", a: "`int()`" },
          { q: "This built-in function turns `3` into `3.0`.", a: "`float()`" },
        ],
        200: [
          { q: "What does `print(float(\"2.5\") * 2)` display?", a: "`5.0`", note: "float(\"2.5\") turns the string into the number 2.5." },
          { q: "What does `print(str(10) + str(5))` display?", a: "`105`", note: "Both are strings, so + joins them." },
          { q: "What does `print(int(7.99))` display?", a: "`7`", note: "int() chops off the decimal. It does not round." },
          { q: "What does `print(int(\"5\") + 2)` display?", a: "`7`", note: "int() turns the string \"5\" into the number 5." },
        ],
        300: [
          { q: "What does `print(int(\"3\") + int(\"4\"))` display?", a: "`7`", note: "Both become numbers, so + adds them." },
          { q: "What does `print(\"3\" + \"4\")` display?", a: "`34`", note: "Both are strings, so + joins them." },
          { q: "What does `print(str(5) + \"2\")` display?", a: "`52`", note: "Both are strings, so + joins them instead of adding." },
          { q: "No matter what the user types, `input()` always returns this data type.", a: "A string (`str`)", note: "That's why we wrap it in int() or float() to do math." },
          { q: "What does `print('It's fun')` display?", a: "`SyntaxError`", note: "The ' in It's ends the string early. Fix: use double quotes, \"It's fun\"." },
        ],
        400: [
          { q: "`age = input(\"Age? \")` and then `age + 1` causes an error. Why?", a: "`input()` returns a string, and you can't add a string and a number", note: "Fix: `age = int(input(\"Age? \"))`" },
          { q: "What does `print(str(2 + 3) + \"0\")` display?", a: "`50`", note: "2 + 3 = 5 first, then str turns it into \"5\" and joins \"0\"." },
          { q: "What does `print(int(float(\"4.7\")))` display?", a: "`4`", note: "float(\"4.7\") gives 4.7, then int() chops it to 4." },
          { q: "What does `print(float(3) + int(2.9))` display?", a: "`5.0`", note: "int(2.9) drops the decimal, giving 2. Then 3.0 + 2 = 5.0." },
          { q: "`print(\"5\" + 5)`: SyntaxError, or an error when it runs?", a: "An error when it runs (`TypeError`)", note: "The code is written correctly. It fails when Python tries to join a string and a number." },
        ],
        500: [
          { q: "What happens when Python runs `int(\"4.7\")`?", a: "An error (ValueError)", note: "int() can't read a decimal string. Use int(float(\"4.7\")) instead." },
          { q: "What does `print(str(1 + 1) * 3)` display?", a: "`222`", note: "1 + 1 = 2, str makes it \"2\", and * 3 repeats it." },
          { q: "What does `print(int(\"1\" + \"2\") * 2)` display?", a: "`24`", note: "\"1\" + \"2\" joins into \"12\", int makes it 12, then 12 * 2." },
          { q: "What does `print(str(int(9.9)) + str(9 // 2))` display?", a: "`94`", note: "int(9.9) = 9 and 9 // 2 = 4. As strings, \"9\" + \"4\" joins them." },
          { q: "`x = input()` and the user types `5`. What does `print(x * 3)` display?", a: "`555`", note: "x is the STRING \"5\", so * 3 repeats it instead of multiplying." },
          { q: "What does `print(int(\"5\") \"5\")` display?", a: "`SyntaxError`", note: "There's no operator between int(\"5\") and \"5\", so Python can't tell what to do with them." },
        ],
      },
    },

    // ======================== RANDOM, MAX & MIN ========================
    { name: "Random, Max & Min",
      challenge: {
        100: [
          { q: "What does `print(max(\"Zebra\", \"apple\"))` display?", a: "`apple`", note: "Lowercase letters count as LARGER than all capital letters." },
          { q: "What does `print(min(\"Zoo\", \"ant\"))` display?", a: "`Zoo`", note: "Capital letters count as SMALLER than all lowercase letters." },
          { q: "What does `print(max(\"cat\", \"car\"))` display?", a: "`cat`", note: "The first two letters match, so compare the third: \"t\" comes after \"r\"." },
          { q: "What does `print(max(min(3, 8), min(5, 2)))` display?", a: "`3`", note: "Inside first: min(3, 8) = 3 and min(5, 2) = 2. Then max(3, 2) = 3." },
          { q: "What does `print(min(3 7 2))` display?", a: "`SyntaxError`", note: "The commas between the numbers are missing." },
        ],
        200: [
          { q: "What does `print(min(\"hello\", \"help\", \"he\"))` display?", a: "`he`", note: "When one word is the start of another, the shorter one is smaller." },
          { q: "What does `print(max(\"easy\", \"medium\", \"New\", \"test\", \"different\", \"prime\"))` display?", a: "`test`", note: "Among the lowercase words, \"t\" comes last. \"New\" loses because capitals count as smaller." },
          { q: "What does `print(max(\"Apple\", \"apple\", \"APPLE\"))` display?", a: "`apple`", note: "Compare the first letter: lowercase \"a\" is larger than capital \"A\"." },
          { q: "What does `print(min(\"10\", \"9\", \"100\"))` display?", a: "`10`", note: "These are STRINGS, compared letter by letter: \"1\" comes before \"9\", and \"10\" is shorter than \"100\"." },
          { q: "What does `print(max(-3, min(-1, -7), -5))` display?", a: "`-3`", note: "min(-1, -7) = -7 first. Then max(-3, -7, -5) = -3." },
          { q: "What does `print(max(3, 7, 2,))` display? Look closely!", a: "`7`", note: "Not an error! Python allows an extra comma at the end of a list of values." },
        ],
        300: [
          { q: "What is the output?", code: "a = 7\nb = -10\nc = 3\nprint(max(a, b, c) - min(a, b, c))", a: "`17`", note: "7 − (-10) = 17." },
          { q: "What is the output?", code: "x = 5\ny = 2.5\nprint(min(x, y) * 2, max(x, y) // 2)", a: "`5.0 2`", note: "min is 2.5 (float), so 5.0. max is 5 (int), so 5 // 2 = 2." },
          { q: "What is the output?", code: "fruit = max(\"pear\", \"Peach\", \"plum\")\nprint(fruit)", a: "`plum`", note: "Capitals count as smaller, so \"Peach\" is out. Then \"pl\" beats \"pe\" because l comes after e." },
        ],
        400: [
          { q: "What is the output?", code: "a = \"10\"\nb = \"9\"\nprint(max(a, b), max(int(a), int(b)))", a: "`9 10`", note: "As strings, \"9\" beats \"10\" because 9 comes after 1. As numbers, 10 wins." },
          { q: "What is the output?", code: "x = min(4, 9) ** 2\ny = max(x, 15) % 7\nprint(x, y)", a: "`16 2`", note: "x = 16. max(16, 15) = 16, and 16 % 7 = 2." },
          { q: "What is the output?", code: "word = min(\"cat\", \"Cat\", \"cAt\")\nprint(word)", a: "`Cat`", note: "All capital letters are smaller than lowercase ones, so the word starting with C wins." },
        ],
        500: [
          { q: "What is the output?", code: "w = \"Zoo\"\nv = \"apple\"\nprint(max(w, v) + min(w, v))", a: "`appleZoo`", note: "Lowercase beats uppercase, so max is \"apple\" and min is \"Zoo\"." },
          { q: "What is the output?", code: "a = 3\nb = 8\nc = 5\nprint(max(a, min(b, c)) * min(a, max(b, c)))", a: "`15`", note: "min(8, 5) = 5, so max(3, 5) = 5. max(8, 5) = 8, so min(3, 8) = 3. Then 5 * 3." },
          { q: "What is the output? Careful!", code: "import random\nx = random.randint(1, 6)\nprint(max(x, 7) - min(x, 0))", a: "`7` every time", note: "x is 1 to 6, so max(x, 7) is always 7 and min(x, 0) is always 0. The random number never matters!" },
        ],
      },
      warmup: {
        100: [
          { q: "What does `print(max(3, 7, 2))` display?", a: "`7`" },
          { q: "What does `print(max(1, 9, 4))` display?", a: "`9`" },
          { q: "What does `print(min(8, 3, 5))` display?", a: "`3`" },
          { q: "Which module contains `choice()`?", a: "`random`" },
        ],
        200: [
          { q: "What does `print(min(2.5, 2, 3))` display?", a: "`2`", note: "2 is smaller than 2.5." },
          { q: "What does `print(max(-1, -10, -5))` display?", a: "`-1`", note: "-1 is the closest to 0, so it's the largest." },
          { q: "What does `print(min(0, -0.5, 1))` display?", a: "`-0.5`", note: "Any negative number is smaller than 0." },
          { q: "What data type does `random.random()` return?", a: "A float (decimal)" },
        ],
        300: [
          { q: "What does `print(max(\"apple\", \"banana\", \"cherry\"))` display?", a: "`cherry`", note: "\"c\" comes last alphabetically." },
          { q: "What does `print(min(\"dog\", \"cat\", \"bird\"))` display?", a: "`bird`", note: "\"b\" comes first alphabetically." },
          { q: "What does `random.choice([\"rock\", \"paper\", \"scissors\"])` do?", a: "Picks one random item from the list" },
          { q: "`random.random()` returns a number in what range?", a: "A decimal from 0.0 up to (not including) 1.0" },
          { q: "What does `print(max(3, 7, 2)` display?", a: "`SyntaxError`", note: "Two ( but only one )." },
        ],
        400: [
          { q: "What does `print(max(\"Zebra\", \"apple\"))` display?", a: "`apple`", note: "Lowercase letters count as LARGER than all capital letters." },
          { q: "What does `print(min(\"Zoo\", \"ant\"))` display?", a: "`Zoo`", note: "Capital letters count as SMALLER than all lowercase letters." },
          { q: "What does `print(max(\"cat\", \"car\"))` display?", a: "`cat`", note: "The first two letters match, so compare the third: \"t\" comes after \"r\"." },
          { q: "What does `print(max(min(3, 8), min(5, 2)))` display?", a: "`3`", note: "Inside first: min(3, 8) = 3 and min(5, 2) = 2. Then max(3, 2) = 3." },
          { q: "What does `print(min(3 7 2))` display?", a: "`SyntaxError`", note: "The commas between the numbers are missing." },
        ],
        500: [
          { q: "What does `print(min(\"hello\", \"help\", \"he\"))` display?", a: "`he`", note: "When one word is the start of another, the shorter one is smaller." },
          { q: "What does `print(max(\"easy\", \"medium\", \"New\", \"test\", \"different\", \"prime\"))` display?", a: "`test`", note: "Among the lowercase words, \"t\" comes last. \"New\" loses because capitals count as smaller." },
          { q: "What does `print(max(\"Apple\", \"apple\", \"APPLE\"))` display?", a: "`apple`", note: "Compare the first letter: lowercase \"a\" is larger than capital \"A\"." },
          { q: "What does `print(min(\"10\", \"9\", \"100\"))` display?", a: "`10`", note: "These are STRINGS, compared letter by letter: \"1\" comes before \"9\", and \"10\" is shorter than \"100\"." },
          { q: "What does `print(max(-3, min(-1, -7), -5))` display?", a: "`-3`", note: "min(-1, -7) = -7 first. Then max(-3, -7, -5) = -3." },
          { q: "What does `print(max(3, 7, 2,))` display? Look closely!", a: "`7`", note: "Not an error! Python allows an extra comma at the end of a list of values." },
        ],
      },
    },

    // ======================== VOCAB VAULT ========================
    { name: "Vocab Vault",
      challenge: {
        100: [
          { q: "What is the difference between `/` and `//`?", a: "`/` keeps the decimal; `//` drops the remainder" },
          { q: "What is the difference between a module and a function?", a: "A module is a collection of code (like math); a function does one job (like sqrt)" },
          { q: "What does the line `import random` do?", a: "Loads the random module so you can use its methods" },
          { q: "Why do we write `math.` in front of `sqrt()`?", a: "It tells Python which module the method comes from" },
        ],
        200: [
          { q: "Name both modules from this unit and one method from each.", a: "math (`sqrt`, `pow`, or `fabs`) and random (`random`, `randint`, or `choice`)" },
          { q: "Name all 7 arithmetic operators in this unit.", a: "`+`  `-`  `*`  `/`  `//`  `%`  `**`" },
          { q: "Which of these need an import: `max()`, `math.pow()`, `int()`, `random.choice()`?", a: "`math.pow()` and `random.choice()`", note: "max() and int() are built-in functions." },
          { q: "Give the result of `5 / 2`, `5 // 2`, and `5 % 2`.", a: "`2.5`, `2`, and `1`", note: "Regular division, floor division, and the remainder." },
          { q: "What's the difference between a syntax error and an error that happens while the code runs?", a: "A syntax error means Python can't read the code at all; a runtime error happens when correctly written code fails, like `int(\"hi\")`", note: "With a syntax error, not even the first line runs." },
        ],
        300: [
          { q: "Name the module, the method, and the built-in function in this program.", code: "import math\nr = math.sqrt(49)\nprint(r)", a: "Module: `math`. Method: `sqrt`. Built-in function: `print`" },
          { q: "In this line, name the assignment, the built-in function, and the operator.", code: "total = max(8, 3) % 5", a: "Assignment: `total = ...`. Built-in function: `max`. Operator: `%`" },
          { q: "What is the difference between a built-in function and a method? Give one example of each from this unit.", a: "A built-in function works on its own, like `max()`. A method belongs to a module, like `math.sqrt()`", note: "Methods need their module imported first." },
        ],
        400: [
          { q: "Which of these are built-in functions? `print`  `sqrt`  `max`  `randint`  `float`", a: "`print`, `max`, and `float`", note: "sqrt and randint are methods that need a module." },
          { q: "Why must `import math` come BEFORE `math.sqrt(16)` in a program?", a: "Python runs top to bottom, so the module has to be loaded before it's used" },
          { q: "Name the 3 methods from the random module in this unit, and what kind of value each returns.", a: "`random()`: a float from 0.0 up to 1.0. `randint(a, b)`: a whole number from a to b. `choice(list)`: one item from the list" },
        ],
        500: [
          { q: "Count them in this program: modules, methods, built-in functions, operators, and assignments.", code: "import random\nn = random.randint(1, 10) % 3\nprint(max(n, 1))", a: "1 module (`random`), 1 method (`randint`), 2 built-in functions (`max`, `print`), 1 operator (`%`), 1 assignment (`n = ...`)" },
          { q: "Explain modular division in one sentence AND give a real-world use for it.", a: "It gives the remainder after dividing", note: "Uses: checking even/odd, leftover minutes after hours, the last digit of a number, splitting into teams." },
          { q: "A classmate says `math.pow(2, 3)` and `2 ** 3` are exactly the same. Give TWO differences.", a: "`math.pow` always returns a float (`8.0`) while `2 ** 3` gives `8`; and `math.pow` needs `import math`" },
        ],
      },
      warmup: {
        100: [
          { q: "A named block of code that does a job, like `print()`.", a: "A function" },
          { q: "A symbol like `+` or `%` that performs an action.", a: "An operator" },
          { q: "The `%` symbol is called the ___ operator.", a: "Modulus (modular division)" },
        ],
        200: [
          { q: "A function that comes with Python and needs no import, like `max()`.", a: "A built-in function" },
          { q: "Another name for the kind of division the `%` operator does.", a: "Modular division (modulus)" },
          { q: "The module that contains `sqrt()`, `pow()`, and `fabs()`.", a: "The math module" },
          { q: "`max()` returns the ___ value, and `min()` returns the ___ value.", a: "Largest, smallest" },
        ],
        300: [
          { q: "In `math.sqrt(16)`, what is `math`?", a: "The module" },
          { q: "In `math.sqrt(16)`, what is `sqrt`?", a: "A method (function) from the math module" },
          { q: "Name 3 built-in functions from this unit.", a: "Any 3 of: `print()`, `input()`, `int()`, `str()`, `float()`, `max()`, `min()`" },
          { q: "What does the `**` operator do?", a: "Exponent (raises to a power)", note: "Example: 2 ** 3 = 8" },
          { q: "The kind of error caused by code that breaks Python's grammar rules, like a missing `)`.", a: "A syntax error", note: "Python can't even read the code, so NONE of the program runs." },
        ],
        400: [
          { q: "What is the difference between `/` and `//`?", a: "`/` keeps the decimal; `//` drops the remainder" },
          { q: "What is the difference between a module and a function?", a: "A module is a collection of code (like math); a function does one job (like sqrt)" },
          { q: "What does the line `import random` do?", a: "Loads the random module so you can use its methods" },
          { q: "Why do we write `math.` in front of `sqrt()`?", a: "It tells Python which module the method comes from" },
        ],
        500: [
          { q: "Name both modules from this unit and one method from each.", a: "math (`sqrt`, `pow`, or `fabs`) and random (`random`, `randint`, or `choice`)" },
          { q: "Name all 7 arithmetic operators in this unit.", a: "`+`  `-`  `*`  `/`  `//`  `%`  `**`" },
          { q: "Which of these need an import: `max()`, `math.pow()`, `int()`, `random.choice()`?", a: "`math.pow()` and `random.choice()`", note: "max() and int() are built-in functions." },
          { q: "Give the result of `5 / 2`, `5 // 2`, and `5 % 2`.", a: "`2.5`, `2`, and `1`", note: "Regular division, floor division, and the remainder." },
          { q: "What's the difference between a syntax error and an error that happens while the code runs?", a: "A syntax error means Python can't read the code at all; a runtime error happens when correctly written code fails, like `int(\"hi\")`", note: "With a syntax error, not even the first line runs." },
        ],
      },
    },

    // ======================== FLOAT OR INT? ========================
    { name: "Float or Int?",
      challenge: {
        100: [
          { q: "Int or float? What does `print(math.pow(2, 3))` display?", a: "`8.0` (float)", note: "math.pow always returns a float, unlike 2 ** 3." },
          { q: "Int or float? What does `print(10 / 5 * 2)` display?", a: "`4.0` (float)", note: "10 / 5 is already 2.0, so the result stays a float." },
          { q: "Int or float? What does `print(min(3, 3.5) + 1)` display?", a: "`4` (int)", note: "min picks the int 3, so 3 + 1 stays an int." },
          { q: "Int or float? What does `print(int(\"7\") / 1)` display?", a: "`7.0` (float)", note: "int(\"7\") is an int, but / always gives a float." },
          { q: "Int or float? What does `print(5 / / 2)` display?", a: "Neither: `SyntaxError`", note: "/ / with a space is two separate operators. Only // (no space) is floor division." },
        ],
        200: [
          { q: "Int or float? What does `print(math.fabs(-4) // 2)` display?", a: "`2.0` (float)", note: "fabs gives 4.0, and a float with // stays a float." },
          { q: "Int or float? What does `print(int(9 / 2) * 2.0)` display?", a: "`8.0` (float)", note: "int(4.5) = 4, then 4 * 2.0 = 8.0." },
          { q: "Int or float? What does `print(max(1, 2) + min(1.0, 5))` display?", a: "`3.0` (float)", note: "max gives the int 2, min gives the float 1.0, and 2 + 1.0 = 3.0." },
          { q: "Int or float? What does `print(7 % 2.0)` display?", a: "`1.0` (float)", note: "% with a float gives a float." },
          { q: "Int or float? What does `print(int(math.sqrt(10)) ** 2)` display?", a: "`9` (int)", note: "math.sqrt(10) is about 3.16, int() makes it 3, and 3 ** 2 = 9 (an int)." },
          { q: "Int or float? What does `print(9 // 2.)` display?", a: "`4.0` (float)", note: "Not an error! 2. is a legal way to write the float 2.0." },
        ],
        300: [
          { q: "Int or float? What is the output?", code: "a = 6\nb = a / 2\nc = b * 2\nprint(c)", a: "`6.0`", note: "a / 2 makes b a float (3.0), so c stays a float." },
          { q: "Int or float? What is the output?", code: "x = 9 // 2\ny = x * 2.0 // 1\nprint(x, y)", a: "`4 8.0`", note: "x is the int 4. Once 2.0 enters the math, y is a float." },
          { q: "Int or float? What is the output?", code: "n = int(4.9) + 1\nprint(n, n / 1)", a: "`5 5.0`", note: "int(4.9) = 4, so n = 5 (int). Dividing by 1 with / still makes a float." },
        ],
        400: [
          { q: "Int or float? What is the output?", code: "import math\na = math.sqrt(25)\nb = int(a) ** 2\nprint(a + b)", a: "`30.0`", note: "a = 5.0 (float), b = 25 (int). A float plus an int is a float." },
          { q: "Int or float? What is the output?", code: "x = 7\nx = x // 2 * 2\nx = x % 4 / 2\nprint(x)", a: "`1.0`", note: "x becomes 6 (int), then 6 % 4 = 2, and 2 / 2 = 1.0. The / makes it a float." },
          { q: "Int or float? What is the output?", code: "a = max(3, 3.0)\nb = min(3.0, 3)\nprint(a, b)", a: "`3 3.0`", note: "When values tie, max and min return the FIRST one listed. So a is the int 3, and b is the float 3.0." },
        ],
        500: [
          { q: "Int or float? What is the output?", code: "x = 5\ny = 2\nz = x / y // 1 * y\nprint(z, int(z) % 2)", a: "`4.0 0`", note: "5 / 2 = 2.5, // 1 gives 2.0, * 2 gives 4.0. int(4.0) % 2 = 0." },
          { q: "Int or float? What is the output?", code: "import math\nn = math.pow(2, 4) // 5 + 7 % 3\nprint(n)", a: "`4.0`", note: "16.0 // 5 = 3.0, and 7 % 3 = 1. 3.0 + 1 = 4.0." },
          { q: "Int or float? What is the output?", code: "a = \"8\"\nb = float(a) // 3\nc = int(a) % 3\nprint(b + c, int(b) * c)", a: "`4.0 4`", note: "b = 2.0 (float), c = 2 (int). b + c = 4.0, but int(b) * c = 4." },
        ],
      },
      warmup: {
        100: [
          { q: "Int or float? What does `print(4 + 2)` display?", a: "`6` (int)", note: "Two ints added give an int." },
          { q: "Int or float? What does `print(8 / 2)` display?", a: "`4.0` (float)", note: "/ ALWAYS gives a float, even when it divides evenly." },
          { q: "Int or float? What does `print(3.5 + 1)` display?", a: "`4.5` (float)", note: "Anything mixed with a float becomes a float." },
          { q: "Int or float? What does `print(7 // 2)` display?", a: "`3` (int)", note: "// with two ints gives an int." },
        ],
        200: [
          { q: "Int or float? What does `print(2 * 3.0)` display?", a: "`6.0` (float)", note: "One float in the math makes the answer a float." },
          { q: "Int or float? What does `print(int(6.8))` display?", a: "`6` (int)", note: "int() chops off the decimal and gives an int." },
          { q: "Int or float? What does `print(float(5))` display?", a: "`5.0` (float)", note: "float() always gives a float." },
          { q: "Int or float? What does `print(10 % 3)` display?", a: "`1` (int)", note: "% with two ints gives an int." },
        ],
        300: [
          { q: "Int or float? What does `print(9 // 2.0)` display?", a: "`4.0` (float)", note: "// with a float gives a float." },
          { q: "Int or float? What does `print(math.sqrt(36))` display?", a: "`6.0` (float)", note: "math methods return floats." },
          { q: "Int or float? What does `print(2 ** 3)` display?", a: "`8` (int)", note: "** with two ints gives an int." },
          { q: "Int or float? What does `print(max(2, 7.0, 5))` display?", a: "`7.0` (float)", note: "max() returns the item exactly as it was written, and 7.0 is a float." },
        ],
        400: [
          { q: "Int or float? What does `print(math.pow(2, 3))` display?", a: "`8.0` (float)", note: "math.pow always returns a float, unlike 2 ** 3." },
          { q: "Int or float? What does `print(10 / 5 * 2)` display?", a: "`4.0` (float)", note: "10 / 5 is already 2.0, so the result stays a float." },
          { q: "Int or float? What does `print(min(3, 3.5) + 1)` display?", a: "`4` (int)", note: "min picks the int 3, so 3 + 1 stays an int." },
          { q: "Int or float? What does `print(int(\"7\") / 1)` display?", a: "`7.0` (float)", note: "int(\"7\") is an int, but / always gives a float." },
          { q: "Int or float? What does `print(5 / / 2)` display?", a: "Neither: `SyntaxError`", note: "/ / with a space is two separate operators. Only // (no space) is floor division." },
        ],
        500: [
          { q: "Int or float? What does `print(math.fabs(-4) // 2)` display?", a: "`2.0` (float)", note: "fabs gives 4.0, and a float with // stays a float." },
          { q: "Int or float? What does `print(int(9 / 2) * 2.0)` display?", a: "`8.0` (float)", note: "int(4.5) = 4, then 4 * 2.0 = 8.0." },
          { q: "Int or float? What does `print(max(1, 2) + min(1.0, 5))` display?", a: "`3.0` (float)", note: "max gives the int 2, min gives the float 1.0, and 2 + 1.0 = 3.0." },
          { q: "Int or float? What does `print(7 % 2.0)` display?", a: "`1.0` (float)", note: "% with a float gives a float." },
          { q: "Int or float? What does `print(int(math.sqrt(10)) ** 2)` display?", a: "`9` (int)", note: "math.sqrt(10) is about 3.16, int() makes it 3, and 3 ** 2 = 9 (an int)." },
          { q: "Int or float? What does `print(9 // 2.)` display?", a: "`4.0` (float)", note: "Not an error! 2. is a legal way to write the float 2.0." },
        ],
      },
    },

    // ======================== SPOT THE BUG ========================
    { name: "Spot the Bug",
      challenge: {
        100: [
          { q: "`print(int(\"3.5\"))` crashes. Fix it so it prints `3`.", a: "`print(int(float(\"3.5\")))`", note: "int() can't read a decimal string, but float() can." },
          { q: "This should print the ones digit of 63, but it prints `6`. Fix it: `print(63 // 10)`", a: "`print(63 % 10)`", note: "// 10 gives the tens digit. % 10 gives the ones digit, 3." },
          { q: "Someone wrote `2 ^ 3` to get 2 to the 3rd power. What's wrong?", a: "Python uses `**` for exponents: `2 ** 3`", note: "^ is a different operator. 2 ^ 3 gives 1, not 8!" },
          { q: "`random.randint(1, 6.5)` causes an error. Why?", a: "randint only works with whole numbers" },
          { q: "Which of these is a SyntaxError: `Print(5)`, `print(5`, or `print(\"5\" + 5)`?", a: "`print(5`", note: "The other two are written correctly but fail when they run: Print isn't a name Python knows, and you can't join a string and a number." },
        ],
        200: [
          { q: "Should print a random number from 1 to 100: `print(random.randint(0, 100))`. What's the bug?", a: "It can print 0. Use `random.randint(1, 100)`.", note: "randint includes both endpoints." },
          { q: "Should roll a die (1 to 6): `random.random() * 6`. Name TWO problems.", a: "It gives decimals, and its range is 0 up to (not including) 6", note: "Fix: `random.randint(1, 6)`" },
          { q: "Should print the number of full dozens in 50 eggs: `print(50 / 12)`. What's the bug?", a: "`/` prints 4.166…; use `50 // 12` to get `4`" },
          { q: "Should print the last digit of 4096: `print(4096 // 10)`. What's the bug?", a: "`// 10` drops the last digit (409). Use `4096 % 10` to get `6`." },
          { q: "Should print the hypotenuse of a 3-4-5 triangle: `print(math.sqrt(3 ** 2 + 4 ** 2))`. What's the bug?", a: "Trick question: there's no bug! It prints `5.0`.", note: "3 ** 2 + 4 ** 2 = 25, and math.sqrt(25) = 5.0." },
          { q: "Only ONE of these is a SyntaxError. Which one? `int(\"hi\")`   `print(10 // 0)`   `x = = 5`   `Print(5)`", a: "`x = = 5`", note: "The others are written correctly but fail when they run: ValueError, ZeroDivisionError, and NameError." },
        ],
        300: [
          { q: "The user types 4 but sees `44`. Which line has the bug, and how do you fix it?", code: "num = input(\"Pick a number: \")\ndouble = num * 2\nprint(double)", a: "Line 1: `num = int(input(\"Pick a number: \"))`", note: "input() gives a string, so * 2 repeats it." },
          { q: "Which line has a SyntaxError, and how do you fix it?", code: "import math\nside = 5\narea = math.pow(side 2)\nprint(area)", a: "Line 3 is missing a comma: `math.pow(side, 2)`" },
          { q: "This should print the average, `7.0`, but it prints `12.0`. Fix it.", code: "x = 10\ny = 4\naverage = x + y / 2\nprint(average)", a: "`average = (x + y) / 2`", note: "Without parentheses only y is divided: 10 + 2.0." },
        ],
        400: [
          { q: "Which line crashes, and how do you fix it?", code: "import random\nroll = random.randint(1, 6)\nprint(\"You rolled \" + roll)", a: "Line 3: `\"You rolled \" + str(roll)`", note: "You can't join a string and an int. (This is an error when it runs, not a SyntaxError.)" },
          { q: "This should print `2 hours 30 minutes`. What's wrong?", code: "hours = 150 % 60\nminutes = 150 // 60\nprint(hours, \"hours\", minutes, \"minutes\")", a: "`%` and `//` are swapped. It prints `30 hours 2 minutes`" },
          { q: "This crashes. Use another math method to fix it so it prints `4.0`.", code: "import math\nx = -16\nprint(math.sqrt(x))", a: "`math.sqrt(math.fabs(x))`", note: "sqrt can't take a negative number. fabs makes it positive first." },
        ],
        500: [
          { q: "This program has TWO bugs. Find both.", code: "import Math\nr = math.sqrt(81\nprint(r)", a: "`import Math` should be `import math`, and line 2 is missing a `)`" },
          { q: "This should print a random EVEN number from 2 to 10. What's the bug?", code: "import random\nn = random.randint(2, 10)\nprint(n * 2)", a: "It prints 4 to 20. Use `random.randint(1, 5) * 2`" },
          { q: "This program has THREE bugs. Find all three.", code: "x = input(\"Number? \")\ny = x ** 2\nPrint(\"Squared: \" + y)", a: "`int(input(...))` on line 1, `print` must be lowercase, and `str(y)` to join" },
        ],
      },
      warmup: {
        100: [
          { q: "`print(\"Hello\"` won't run. What's missing?", a: "The closing parenthesis `)`" },
          { q: "`Print(\"Hi\")` causes an error. Why?", a: "Python is case-sensitive. It must be `print`." },
          { q: "This should print the word Hi: `print(Hi)`. What's wrong?", a: "It needs quotes: `print(\"Hi\")`", note: "Without quotes, Python looks for a variable named Hi." },
          { q: "`import Math` causes an error. Why?", a: "Module names are case-sensitive. It must be `import math`." },
        ],
        200: [
          { q: "`random.randint(1-10)` should pick a number from 1 to 10. What's wrong?", a: "It needs a comma: `random.randint(1, 10)`", note: "1-10 is just the number -9." },
          { q: "`print(\"Score: \" + 10)` causes an error. Why?", a: "You can't join a string and a number", note: "Fix: `\"Score: \" + str(10)`" },
          { q: "`x = 5 +` causes an error. Why?", a: "Nothing comes after the `+`", note: "Every operator needs a value on both sides." },
          { q: "`math.sqrt(25)` gives the error \"name 'math' is not defined\". What's missing?", a: "`import math` at the top" },
          { q: "What does `print(\"Hello)` display?", a: "`SyntaxError`", note: "The string never closes. It needs a \" before the )." },
        ],
        300: [
          { q: "`num = input(\"Number? \")` then `print(num * 2)`. The user types 4 but sees 44. Why?", a: "`input()` returns a string, so `* 2` repeats it", note: "Fix: `num = int(input(\"Number? \"))`" },
          { q: "`random.choice(1, 2, 3)` causes an error. Fix it.", a: "`random.choice([1, 2, 3])`", note: "choice needs ONE list, in square brackets." },
          { q: "This should print `2.5` but prints `2`: `print(5 // 2)`. Fix it.", a: "Use `/` instead: `print(5 / 2)`" },
          { q: "`math.pow(2)` causes an error. Why?", a: "It needs two numbers: the base and the exponent", note: "Example: `math.pow(2, 3)`" },
          { q: "`x + 1 = y` causes an error. What kind, and how do you fix it?", a: "`SyntaxError`. Fix: `y = x + 1`", note: "The variable being stored into always goes on the LEFT of =." },
        ],
        400: [
          { q: "`print(int(\"3.5\"))` crashes. Fix it so it prints `3`.", a: "`print(int(float(\"3.5\")))`", note: "int() can't read a decimal string, but float() can." },
          { q: "This should print the ones digit of 63, but it prints `6`. Fix it: `print(63 // 10)`", a: "`print(63 % 10)`", note: "// 10 gives the tens digit. % 10 gives the ones digit, 3." },
          { q: "Someone wrote `2 ^ 3` to get 2 to the 3rd power. What's wrong?", a: "Python uses `**` for exponents: `2 ** 3`", note: "^ is a different operator. 2 ^ 3 gives 1, not 8!" },
          { q: "`random.randint(1, 6.5)` causes an error. Why?", a: "randint only works with whole numbers" },
          { q: "Which of these is a SyntaxError: `Print(5)`, `print(5`, or `print(\"5\" + 5)`?", a: "`print(5`", note: "The other two are written correctly but fail when they run: Print isn't a name Python knows, and you can't join a string and a number." },
        ],
        500: [
          { q: "Should print a random number from 1 to 100: `print(random.randint(0, 100))`. What's the bug?", a: "It can print 0. Use `random.randint(1, 100)`.", note: "randint includes both endpoints." },
          { q: "Should roll a die (1 to 6): `random.random() * 6`. Name TWO problems.", a: "It gives decimals, and its range is 0 up to (not including) 6", note: "Fix: `random.randint(1, 6)`" },
          { q: "Should print the number of full dozens in 50 eggs: `print(50 / 12)`. What's the bug?", a: "`/` prints 4.166…; use `50 // 12` to get `4`" },
          { q: "Should print the last digit of 4096: `print(4096 // 10)`. What's the bug?", a: "`// 10` drops the last digit (409). Use `4096 % 10` to get `6`." },
          { q: "Should print the hypotenuse of a 3-4-5 triangle: `print(math.sqrt(3 ** 2 + 4 ** 2))`. What's the bug?", a: "Trick question: there's no bug! It prints `5.0`.", note: "3 ** 2 + 4 ** 2 = 25, and math.sqrt(25) = 5.0." },
          { q: "Only ONE of these is a SyntaxError. Which one? `int(\"hi\")`   `print(10 // 0)`   `x = = 5`   `Print(5)`", a: "`x = = 5`", note: "The others are written correctly but fail when they run: ValueError, ZeroDivisionError, and NameError." },
        ],
      },
    },

    // ======================== FILL IN THE BLANK ========================
    { name: "Fill in the Blank",
      challenge: {
        100: [
          { q: "Fill in the blank so the program prints `5`.", code: "a = 29\nb = 6\nprint(a ___ b)", a: "`%`", note: "29 ÷ 6 = 4 with 5 left over." },
          { q: "The user types `12`. Fill in the blank so the program prints `13`.", code: "n = ___(input())\nprint(n + 1)", a: "`int`", note: "float() would print 13.0, and str() would crash." },
          { q: "Fill in the blank so the program prints `8.0`.", code: "import ___\nprint(math.sqrt(64))", a: "`math`" },
        ],
        200: [
          { q: "Fill in the blank so the program prints `3.25`.", code: "x = 13\nprint(x ___ 4)", a: "`/`", note: "Only regular division keeps the decimal." },
          { q: "Fill in the blank so the program prints `gogogo`.", code: "word = \"go\"\nprint(word ___ 3)", a: "`*`", note: "A string times a number repeats it." },
          { q: "Fill in the blank so the program prints `Banana`.", code: "print(___(\"cherry\", \"apple\", \"Banana\"))", a: "`min`", note: "Capital letters count as smaller than lowercase." },
        ],
        300: [
          { q: "Fill in the blank so the program prints `40`.", code: "x = 46\ny = x ___ 10\nprint(y * 10)", a: "`//`", note: "46 // 10 = 4. This rounds down to the nearest 10." },
          { q: "Fill in the blank so the program prints `38`.", code: "w = ___(19, 4.5, 11)\nprint(w * 2)", a: "`max`" },
          { q: "Fill in all 2 blanks so the program prints `8`.", code: "a = 17\nb = a ___ 3\nprint(b ___ 4)", a: "`%`  `*`", note: "17 % 3 = 2, then 2 * 4 = 8." },
        ],
        400: [
          { q: "Fill in the blank so the program prints `18.0`.", code: "import math\nside = ___\nprint(math.sqrt(side) * 2)", a: "`81`", note: "sqrt(81) = 9.0, and 9.0 * 2 = 18.0." },
          { q: "Fill in the blank so the program prints `6`.", code: "x = int(___(\"6.8\"))\nprint(x)", a: "`float`", note: "int(\"6.8\") alone would crash. float() first, then int() chops to 6." },
          { q: "Fill in all 2 blanks so the program prints `29`.", code: "print(8 ___ 3 ___ 5)", a: "`*`  `+`", note: "8 * 3 = 24, then 24 + 5." },
        ],
        500: [
          { q: "Fill in all 2 blanks so the program prints `14 2`.", code: "total = 100\nteams = 7\nprint(total ___ teams, total ___ teams)", a: "`//`  `%`", note: "100 students make 14 full teams of 7, with 2 left over." },
          { q: "Fill in the blank so the program prints `10 55`.", code: "a = \"5\"\nprint(___(a) * 2, a * 2)", a: "`int`", note: "int(a) * 2 multiplies. The plain string a * 2 repeats." },
          { q: "Fill in all 2 blanks so the program prints `5`.", code: "x = 2\nx = x ___ 5\nx = x ___ 9\nprint(x)", a: "`**`  `%`", note: "2 ** 5 = 32, then 32 % 9 = 5." },
          { q: "Fill in both blanks so this prints a random multiple of 3 from 3 to 30.", code: "import random\nn = random.randint(___, ___) * 3\nprint(n)", a: "`1` and `10`", note: "1 * 3 = 3 and 10 * 3 = 30." },
        ],
      },
      warmup: {
        100: [
          { q: "`print(7 ___ 2)` displays `9`.", a: "`+`" },
          { q: "`print(7 ___ 2)` displays `14`.", a: "`*`" },
          { q: "`___ math` lets you use math methods.", a: "`import`" },
          { q: "`print(___(3, 9, 5))` displays `9`.", a: "`max`" },
        ],
        200: [
          { q: "`print(7 ___ 2)` displays `3.5`.", a: "`/`" },
          { q: "`print(7 ___ 2)` displays `1`.", a: "`%`", note: "7 ÷ 2 = 3 with 1 left over." },
          { q: "`print(7 ___ 2)` displays `49`.", a: "`**`", note: "7 to the 2nd power." },
          { q: "`print(___(\"12\") + 1)` displays `13`.", a: "`int`" },
        ],
        300: [
          { q: "`print(7 ___ 2)` displays `3`.", a: "`//`", note: "Floor division drops the .5." },
          { q: "`print(math.___(81))` displays `9.0`.", a: "`sqrt`" },
          { q: "`print(random.___([\"a\", \"b\"]))` displays either `a` or `b`.", a: "`choice`" },
          { q: "`print(___(4) + \"!\")` displays `4!`.", a: "`str`", note: "You can only join a string to a string." },
          { q: "`print(7 ___ 2)` causes a SyntaxError. Which of these is in the blank: `**`, `//`, or `=`?", a: "`=`", note: "= stores a value. It can't be used inside an expression like this." },
        ],
        400: [
          { q: "`print(math.___(-3))` displays `3.0`.", a: "`fabs`" },
          { q: "`print(___(9 / 2))` displays `4`.", a: "`int`", note: "9 / 2 = 4.5, and int() chops it to 4." },
          { q: "`print(math.pow(___, 2))` displays `49.0`.", a: "`7` (or `-7`)" },
          { q: "`print(___(\"2.5\") * 2)` displays `5.0`.", a: "`float`" },
        ],
        500: [
          { q: "`print(10 ___ 4)` displays `2`. TWO different operators work. Name both.", a: "`//` and `%`", note: "10 // 4 = 2, and 10 % 4 = 2." },
          { q: "`print(2 ___ 3 ___ 2)` displays `512`. Fill both blanks.", a: "`**` and `**`", note: "Right to left: 3 ** 2 = 9, then 2 ** 9 = 512." },
          { q: "`print(___(___(\"9.6\")))` displays `9`. Fill both blanks.", a: "`int` and `float`: `int(float(\"9.6\"))`" },
          { q: "`print(random.randint(___, ___) * 2)` should give any even number from 2 to 20. Fill both blanks.", a: "`1` and `10`", note: "1 * 2 = 2 and 10 * 2 = 20." },
          { q: "Fill in both blanks so `print(9 ___ 2 ___ 4)` displays `16`.", a: "`//` and `*`", note: "9 // 2 = 4, then 4 * 4 = 16. No other pair of operators works." },
        ],
      },
    },

    // ======================== VARIABLE TRACKER ========================
    { name: "Variable Tracker",
      challenge: {
        100: [
          { q: "After `a = 3`, then `b = 4`, then `a = b`, then `b = a`, what are `a` and `b`?", a: "a = `4`, b = `4`", note: "a = b makes a 4. Then b = a copies 4 back. The 3 is lost!" },
          { q: "After `x = 5`, then `x = x ** 2`, then `x = x % 7`, what is `x`?", a: "`4`", note: "5 ** 2 = 25, then 25 % 7 = 4." },
          { q: "After `s = \"ab\"`, then `s = s * 2 + s`, what is `s`?", a: "`ababab`", note: "\"ab\" * 2 = \"abab\", then + \"ab\" joins one more." },
          { q: "After `n = 10`, then `n = n // 3 * 3`, what is `n`?", a: "`9`", note: "10 // 3 = 3, then 3 * 3 = 9." },
          { q: "What happens when Python runs `5 = x`?", a: "`SyntaxError`", note: "The variable must be on the LEFT: x = 5." },
        ],
        200: [
          { q: "After `a = 5`, then `b = 3`, then `a = a + b`, then `b = a - b`, then `a = a - b`, what are `a` and `b`?", a: "a = `3`, b = `5`", note: "a becomes 8, b becomes 8 − 3 = 5, then a becomes 8 − 5 = 3. They swapped!" },
          { q: "After `x = 2`, then `x = x ** x ** x`, what is `x`?", a: "`16`", note: "Right to left: 2 ** 2 = 4, then 2 ** 4 = 16." },
          { q: "After `x = 7`, then `y = x // 2`, then `x = y * 2 + x % 2`, what is `x`?", a: "`7`", note: "y = 3. Then 3 * 2 = 6, 7 % 2 = 1, and 6 + 1 = 7." },
          { q: "After `a = \"5\"`, then `b = a * 2`, then `c = int(b) + 1`, what is `c`?", a: "`56`", note: "a * 2 repeats the string: \"55\". int(\"55\") + 1 = 56." },
          { q: "After `x = 5`, then `y = x + 2`, what is `x`? Look closely!", a: "`5`", note: "Only y was assigned a new value. x was never changed, so it's still 5." },
        ],
        300: [
          { q: "What is the output?", code: "a = 5\nb = a + 2\na = b * 2\nb = a - b\nprint(a, b)", a: "`14 7`", note: "b = 7, then a = 14, then b = 14 − 7 = 7." },
          { q: "What is the output?", code: "x = 3\nx = x * 2\nx = x + x\nx = x // 5\nprint(x)", a: "`2`", note: "3 → 6 → 12 → 2." },
          { q: "What is the output?", code: "s = \"hi\"\nt = s\ns = s + \"!\"\nprint(s, t)", a: "`hi! hi`", note: "t got a copy of \"hi\". Changing s later doesn't change t." },
        ],
        400: [
          { q: "What is the output?", code: "a = 2\nb = 3\nc = a\na = b\nb = c\nprint(a, b)", a: "`3 2`", note: "c saves the old a, so the swap works this time." },
          { q: "What is the output?", code: "total = 0\ntotal = total + 5\ntotal = total * 3\ntotal = total % 4\ntotal = total ** 2\nprint(total)", a: "`9`", note: "0 → 5 → 15 → 3 → 9." },
          { q: "What is the output?", code: "x = 10\ny = x\nx = x // 3\ny = y % 3\nx = x + y\nprint(x, y)", a: "`4 1`", note: "y starts at 10. x = 3, y = 1, then x = 3 + 1." },
        ],
        500: [
          { q: "What is the output?", code: "a = 4\nb = 6\na = a + b\nb = a - b\na = a - b\nb = b * a\nprint(a, b)", a: "`6 24`", note: "a = 10, b = 4, a = 6 (a and b swapped!), then b = 4 * 6." },
          { q: "What is the output?", code: "n = 5\nn = n * n - n\nn = n // 3 % 4\nn = n ** n\nprint(n)", a: "`4`", note: "25 − 5 = 20. 20 // 3 = 6, and 6 % 4 = 2. Then 2 ** 2." },
          { q: "What is the output?", code: "x = \"4\"\ny = x * 2\nx = int(y) // 4\ny = str(x) + y\nprint(x, y)", a: "`11 1144`", note: "y = \"44\". x = 44 // 4 = 11. y = \"11\" + \"44\"." },
        ],
      },
      warmup: {
        100: [
          { q: "After `x = 7`, what is `x`?", a: "`7`", note: "The value 7 is stored in x." },
          { q: "After `name = \"Ada\"`, what is `name`?", a: "`Ada`", note: "The string is stored in name." },
          { q: "After `x = 3`, then `x = 10`, what is `x`?", a: "`10`", note: "The newest assignment replaces the old value." },
          { q: "Which line stores 5 in score: `score = 5` or `5 = score`?", a: "`score = 5`", note: "The variable always goes on the LEFT of =. The other line is a SyntaxError." },
        ],
        200: [
          { q: "After `x = 4`, then `x = x + 1`, what is `x`?", a: "`5`", note: "The right side uses the old x (4), then stores 5." },
          { q: "After `a = 2`, then `b = a * 3`, what is `b`?", a: "`6`", note: "b gets 2 * 3." },
          { q: "After `x = 10`, then `x = x // 3`, what is `x`?", a: "`3`", note: "10 // 3 = 3 is stored back in x." },
          { q: "After `s = \"hi\"`, then `s = s + \"!\"`, what is `s`?", a: "`hi!`", note: "+ joins the strings." },
        ],
        300: [
          { q: "After `x = 2`, then `x = x * x`, then `x = x * x`, what is `x`?", a: "`16`", note: "2 * 2 = 4, then 4 * 4 = 16." },
          { q: "After `a = 5`, then `b = 2`, then `a = a % b`, what is `a`?", a: "`1`", note: "5 % 2 = 1." },
          { q: "After `x = 9`, then `x = x / 3`, what is `x`?", a: "`3.0`", note: "/ always gives a float." },
          { q: "After `a = 1`, then `b = a + 1`, then `a = b + 1`, what is `a`?", a: "`3`", note: "b becomes 2, then a becomes 3." },
          { q: "After `x = 4`, then `x = x +`, what is `x`?", a: "`SyntaxError`: the program never runs", note: "Python checks the whole program for syntax errors first, so not even x = 4 runs." },
        ],
        400: [
          { q: "After `a = 3`, then `b = 4`, then `a = b`, then `b = a`, what are `a` and `b`?", a: "a = `4`, b = `4`", note: "a = b makes a 4. Then b = a copies 4 back. The 3 is lost!" },
          { q: "After `x = 5`, then `x = x ** 2`, then `x = x % 7`, what is `x`?", a: "`4`", note: "5 ** 2 = 25, then 25 % 7 = 4." },
          { q: "After `s = \"ab\"`, then `s = s * 2 + s`, what is `s`?", a: "`ababab`", note: "\"ab\" * 2 = \"abab\", then + \"ab\" joins one more." },
          { q: "After `n = 10`, then `n = n // 3 * 3`, what is `n`?", a: "`9`", note: "10 // 3 = 3, then 3 * 3 = 9." },
          { q: "What happens when Python runs `5 = x`?", a: "`SyntaxError`", note: "The variable must be on the LEFT: x = 5." },
        ],
        500: [
          { q: "After `a = 5`, then `b = 3`, then `a = a + b`, then `b = a - b`, then `a = a - b`, what are `a` and `b`?", a: "a = `3`, b = `5`", note: "a becomes 8, b becomes 8 − 3 = 5, then a becomes 8 − 5 = 3. They swapped!" },
          { q: "After `x = 2`, then `x = x ** x ** x`, what is `x`?", a: "`16`", note: "Right to left: 2 ** 2 = 4, then 2 ** 4 = 16." },
          { q: "After `x = 7`, then `y = x // 2`, then `x = y * 2 + x % 2`, what is `x`?", a: "`7`", note: "y = 3. Then 3 * 2 = 6, 7 % 2 = 1, and 6 + 1 = 7." },
          { q: "After `a = \"5\"`, then `b = a * 2`, then `c = int(b) + 1`, what is `c`?", a: "`56`", note: "a * 2 repeats the string: \"55\". int(\"55\") + 1 = 56." },
          { q: "After `x = 5`, then `y = x + 2`, what is `x`? Look closely!", a: "`5`", note: "Only y was assigned a new value. x was never changed, so it's still 5." },
        ],
      },
    },

    // ======================== RANDOM RANGES ========================
    { name: "Random Ranges",
      challenge: {
        100: [
          { q: "What is the range of `random.random() * 10`?", a: "0.0 up to (not including) 10.0" },
          { q: "What values can `random.randint(1, 10) % 2` give?", a: "0 or 1", note: "Even numbers give 0, odd numbers give 1." },
          { q: "What values can `random.randint(1, 5) // 2` give?", a: "0, 1, or 2", note: "1 → 0, 2 and 3 → 1, 4 and 5 → 2." },
          { q: "What is the range of `random.random() + 1`?", a: "1.0 up to (not including) 2.0" },
          { q: "What values can `print(random.randint(1, 6)))` display?", a: "None. It's a `SyntaxError`", note: "There's one extra ) at the end." },
        ],
        200: [
          { q: "What values can `int(random.random() * 6) + 1` give?", a: "1, 2, 3, 4, 5, or 6", note: "random() * 6 is 0 to 5.99…, int() makes it 0 to 5, and + 1 makes it 1 to 6. It's a die!" },
          { q: "What values can `random.randint(1, 3) ** 2` give?", a: "1, 4, or 9" },
          { q: "What is the range of `random.randint(1, 6) - random.randint(1, 6)`?", a: "-5 to 5", note: "Smallest: 1 − 6. Largest: 6 − 1." },
          { q: "How many DIFFERENT results can `random.randint(1, 4) * random.randint(1, 4)` give?", a: "9", note: "1, 2, 3, 4, 6, 8, 9, 12, 16. Some products repeat, like 2 × 2 and 1 × 4." },
          { q: "What are the smallest and largest possible results of `max(random.randint(1, 6), random.randint(1, 6))`?", a: "1 and 6", note: "Both dice would have to roll 1 to get 1." },
        ],
        300: [
          { q: "What are ALL the values this could print?", code: "import random\nr = random.randint(1, 3)\nprint(r * r + 1)", a: "`2`, `5`, or `10`", note: "1 * 1 + 1, 2 * 2 + 1, 3 * 3 + 1." },
          { q: "What are ALL the values this could print?", code: "import random\nn = random.randint(0, 4) * 2 + 1\nprint(n)", a: "`1`, `3`, `5`, `7`, or `9`", note: "Doubling and adding 1 always gives an odd number." },
          { q: "How many DIFFERENT values could this print?", code: "import random\nprint(random.randint(-3, 3) ** 2)", a: "`4` (0, 1, 4, and 9)", note: "-3 and 3 both give 9, -2 and 2 both give 4, and so on." },
        ],
        400: [
          { q: "What are ALL the values this could print?", code: "import random\nx = random.randint(1, 10)\nprint(x % 3)", a: "`0`, `1`, or `2`", note: "% 3 can only leave a remainder of 0, 1, or 2." },
          { q: "What are ALL the values this could print?", code: "import random\na = random.randint(1, 2)\nb = random.randint(1, 2)\nprint(a * 10 + b)", a: "`11`, `12`, `21`, or `22`" },
          { q: "What is the smallest and largest value this could print?", code: "import random\nn = random.randint(10, 99)\nprint(n // 10)", a: "`1` and `9`", note: "// 10 gives the tens digit of a two-digit number." },
        ],
        500: [
          { q: "What are ALL the values this could print?", code: "import random\nx = random.randint(1, 6)\ny = random.randint(1, 6)\nprint(max(x, y) - min(x, y))", a: "`0` through `5`", note: "Rolling the same number gives 0. A 1 and a 6 gives 5." },
          { q: "How many DIFFERENT values could this print?", code: "import random\nprint(random.randint(1, 3) + random.randint(1, 3) * 10)", a: "`9` (11, 12, 13, 21, ... 33)", note: "The * 10 part sets the tens digit and the other part sets the ones digit." },
          { q: "What are ALL the values this could print?", code: "import random\nn = random.randint(1, 20)\nprint(n % 2 + n % 3)", a: "`0`, `1`, `2`, or `3`", note: "n % 2 is 0 or 1, n % 3 is 0 to 2. Every combination happens somewhere from 1 to 20." },
        ],
      },
      warmup: {
        100: [
          { q: "`random.randint(1, 3)` can return which values?", a: "1, 2, or 3", note: "randint includes both endpoints." },
          { q: "Can `random.randint(1, 10)` ever return `10`?", a: "Yes", note: "randint includes the last number." },
          { q: "What can `random.choice([\"heads\", \"tails\"])` return?", a: "`heads` or `tails`" },
          { q: "How many different values can `random.randint(1, 4)` return?", a: "4", note: "1, 2, 3, and 4." },
        ],
        200: [
          { q: "How many different values can `random.randint(0, 9)` return?", a: "10", note: "0 through 9 is ten numbers." },
          { q: "What is the smallest value `random.randint(-5, 5)` can return?", a: "`-5`" },
          { q: "Which of these can `random.randint(2, 4)` return: 1, 3, or 5?", a: "3" },
          { q: "Can `random.random()` ever return `0.0`?", a: "Yes", note: "The range starts AT 0.0 and goes up to (not including) 1.0." },
        ],
        300: [
          { q: "What values can `random.randint(1, 3) * 10` give?", a: "10, 20, or 30" },
          { q: "What is the range of `random.randint(1, 6) + 1`?", a: "2 to 7" },
          { q: "How many different values can `random.randint(5, 15)` return?", a: "11", note: "Not 10! Count both endpoints: 15 − 5 + 1." },
          { q: "What values can `random.choice([1, 2, 3]) * 2` give?", a: "2, 4, or 6" },
          { q: "What values can `random.randint(1 6)` give?", a: "None. It's a `SyntaxError`", note: "The comma between 1 and 6 is missing." },
        ],
        400: [
          { q: "What is the range of `random.random() * 10`?", a: "0.0 up to (not including) 10.0" },
          { q: "What values can `random.randint(1, 10) % 2` give?", a: "0 or 1", note: "Even numbers give 0, odd numbers give 1." },
          { q: "What values can `random.randint(1, 5) // 2` give?", a: "0, 1, or 2", note: "1 → 0, 2 and 3 → 1, 4 and 5 → 2." },
          { q: "What is the range of `random.random() + 1`?", a: "1.0 up to (not including) 2.0" },
          { q: "What values can `print(random.randint(1, 6)))` display?", a: "None. It's a `SyntaxError`", note: "There's one extra ) at the end." },
        ],
        500: [
          { q: "What values can `int(random.random() * 6) + 1` give?", a: "1, 2, 3, 4, 5, or 6", note: "random() * 6 is 0 to 5.99…, int() makes it 0 to 5, and + 1 makes it 1 to 6. It's a die!" },
          { q: "What values can `random.randint(1, 3) ** 2` give?", a: "1, 4, or 9" },
          { q: "What is the range of `random.randint(1, 6) - random.randint(1, 6)`?", a: "-5 to 5", note: "Smallest: 1 − 6. Largest: 6 − 1." },
          { q: "How many DIFFERENT results can `random.randint(1, 4) * random.randint(1, 4)` give?", a: "9", note: "1, 2, 3, 4, 6, 8, 9, 12, 16. Some products repeat, like 2 × 2 and 1 × 4." },
          { q: "What are the smallest and largest possible results of `max(random.randint(1, 6), random.randint(1, 6))`?", a: "1 and 6", note: "Both dice would have to roll 1 to get 1." },
        ],
      },
    },
  ],

  // ======================== FINAL JEOPARDY ========================
  finals: [
    { category: "String Showdown", q: "What does `print(min(\"easy\", \"medium\", \"New\", \"test\", \"different\", \"prime\"))` display?", a: "`New`", note: "Capital letters sort BEFORE all lowercase letters, so \"New\" is the smallest." },
    { category: "String Showdown", q: "What does `print(min(\"Zebra\", \"apple\", \"Mango\"))` display?", a: "`Mango`", note: "Capital letters come before lowercase, and \"M\" comes before \"Z\"." },
    { category: "String Showdown", q: "What does `print(max(\"apple\", \"Banana\", \"cherry\"))` display?", a: "`cherry`", note: "Lowercase beats uppercase, and \"c\" comes after \"a\"." },
    { category: "Order of Operations", q: "What does `print(-2 ** 2)` display?", a: "`-4`", note: "The exponent happens before the minus sign: -(2 ** 2)." },
    { category: "Order of Operations", q: "What does `print(int(\"2\") ** int(\"3\") % 5)` display?", a: "`3`", note: "2 ** 3 = 8 first, then 8 % 5 = 3." },
    { category: "Operator Mashup", q: "What does `print(7 // 2 * 2 + 7 % 2)` display?", a: "`7`", note: "7 // 2 = 3, 3 * 2 = 6, 7 % 2 = 1, and 6 + 1 = 7. This works for ANY number!" },
    { category: "Type Twister", q: "What does `print(int(\"3\" * 2) // 4 % 5)` display?", a: "`3`", note: "\"3\" * 2 = \"33\", int makes it 33, 33 // 4 = 8, then 8 % 5 = 3." },
    { category: "String Showdown", q: "What does `print(max(\"9\", \"10\") + str(min(9, 10)))` display?", a: "`99`", note: "As strings, \"9\" beats \"10\" because \"9\" comes after \"1\". Then \"9\" + \"9\" joins to \"99\"." },
    { category: "Trace It", q: "What is the output?", code: "a = 7\nb = a // 2\nc = str(b) * b\nprint(int(c) % a, c)", a: "`4 333`", note: "b = 3. c = \"3\" * 3 = \"333\". 333 % 7 = 4." },
    { category: "Trace It", q: "What is the output?", code: "x = -5\ny = x // 2 + x % 2\nprint(y, y ** 2)", a: "`-2 4`", note: "-5 // 2 rounds DOWN to -3, and -5 % 2 = 1. So y = -2, and (-2) ** 2 = 4." },
  ]
};