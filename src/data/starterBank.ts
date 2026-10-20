import { SampleQuestion } from "../types";

export const SAMPLE_QUESTIONS: SampleQuestion[] = [
  // Math - Primary
  {
    id: "m-pri-1",
    subject: "Math",
    level: "Primary School",
    question: "If Sarah has 24 apples and gives 1/3 of them to Ali and 4 apples to Fatima, how many apples does she have left?",
    hintSnippet: "Find 1/3 of 24 first, then add Fatima's apples.",
    category: "Arithmetic & Fractions",
  },
  {
    id: "m-pri-2",
    subject: "Math",
    level: "Primary School",
    question: "What is the perimeter of a rectangle with length 15 cm and width 8 cm?",
    hintSnippet: "Perimeter is 2 × (length + width).",
    category: "Geometry",
  },
  {
    id: "m-pri-3",
    subject: "Math",
    level: "Primary School",
    question: "Find the least common multiple (LCM) of 6, 8, and 12.",
    hintSnippet: "List multiples or factor into prime factors (2 and 3).",
    category: "Number Theory",
  },
  // Math - High School
  {
    id: "m-hs-1",
    subject: "Math",
    level: "High School (Matric/O-Level)",
    question: "Solve the quadratic equation: 2x² - 7x + 3 = 0 using the quadratic formula.",
    hintSnippet: "Use x = (-b ± √(b² - 4ac)) / (2a) with a=2, b=-7, c=3.",
    category: "Algebra",
  },
  {
    id: "m-hs-2",
    subject: "Math",
    level: "High School (Matric/O-Level)",
    question: "A right-angled triangle has a hypotenuse of 13 cm and one leg of 5 cm. Calculate the angle opposite the 5 cm leg.",
    hintSnippet: "Recall sin(θ) = opposite / hypotenuse = 5 / 13.",
    category: "Trigonometry",
  },
  {
    id: "m-hs-3",
    subject: "Math",
    level: "High School (Matric/O-Level)",
    question: "Find the equation of the line passing through points (2, -3) and (6, 5).",
    hintSnippet: "Compute slope m = (y2 - y1)/(x2 - x1), then use point-slope form.",
    category: "Coordinate Geometry",
  },
  // Math - Intermediate
  {
    id: "m-int-1",
    subject: "Math",
    level: "Intermediate (F.Sc/A-Level)",
    question: "Evaluate the indefinite integral: ∫ (3x² + 4x - 5) / (x³ + 2x² - 5x + 7) dx.",
    hintSnippet: "Notice the numerator is the exact derivative of the denominator: ∫ f'(x)/f(x) dx = ln|f(x)|.",
    category: "Calculus",
  },
  {
    id: "m-int-2",
    subject: "Math",
    level: "Intermediate (F.Sc/A-Level)",
    question: "Find the eigenvalues and eigenvectors of the 2x2 matrix: [[4, 1], [2, 3]].",
    hintSnippet: "Solve the characteristic equation det(A - λI) = 0.",
    category: "Linear Algebra",
  },
  // Physics - High School
  {
    id: "p-hs-1",
    subject: "Physics",
    level: "High School (Matric/O-Level)",
    question: "A car accelerates uniformly from rest to 72 km/h in 8 seconds. Calculate its acceleration and the distance traveled.",
    hintSnippet: "Convert 72 km/h to m/s (divide by 3.6), then apply v = u + at and s = ut + 0.5at².",
    category: "Kinematics",
  },
  {
    id: "p-hs-2",
    subject: "Physics",
    level: "High School (Matric/O-Level)",
    question: "A 500 N force acts on a surface area of 0.25 m². What pressure is exerted on the surface in Pascals?",
    hintSnippet: "Pressure P = Force / Area.",
    category: "Mechanics",
  },
  // Physics - Intermediate
  {
    id: "p-int-1",
    subject: "Physics",
    level: "Intermediate (F.Sc/A-Level)",
    question: "Calculate the de Broglie wavelength of an electron accelerated through a potential difference of 150 Volts.",
    hintSnippet: "Kinetic energy = eV. Wavelength λ = h / √(2m eV).",
    category: "Quantum Physics",
  },
  {
    id: "p-int-2",
    subject: "Physics",
    level: "Intermediate (F.Sc/A-Level)",
    question: "In Young's double-slit experiment, the slits are separated by 0.3 mm and the screen is 1.2 m away. If yellow light of wavelength 589 nm is used, what is the fringe width?",
    hintSnippet: "Fringe width β = (λ × D) / d.",
    category: "Wave Optics",
  },
  // Chemistry - High School
  {
    id: "c-hs-1",
    subject: "Chemistry",
    level: "High School (Matric/O-Level)",
    question: "Balance the redox chemical equation: Fe + H2SO4 → Fe2(SO4)3 + SO2 + H2O.",
    hintSnippet: "Check oxidation states of Iron and Sulfur, balance electrons transferred.",
    category: "Chemical Equations",
  },
  {
    id: "c-hs-2",
    subject: "Chemistry",
    level: "High School (Matric/O-Level)",
    question: "Calculate the molar mass and percentage composition by mass of each element in hydrated copper sulfate (CuSO4·5H2O).",
    hintSnippet: "Atomic masses: Cu=63.5, S=32, O=16, H=1.",
    category: "Stoichiometry",
  },
  // Biology - High School
  {
    id: "b-hs-1",
    subject: "Biology",
    level: "High School (Matric/O-Level)",
    question: "Explain the light-dependent reactions of photosynthesis and why photolysis of water is essential.",
    hintSnippet: "Focus on Thylakoid membranes, chlorophyll excitation, ATP/NADPH synthesis, and oxygen release.",
    category: "Cellular Biology",
  },
  {
    id: "b-hs-2",
    subject: "Biology",
    level: "High School (Matric/O-Level)",
    question: "If a heterozygous tall pea plant (Tt) is crossed with a dwarf pea plant (tt), what are the expected genotypic and phenotypic ratios in the offspring?",
    hintSnippet: "Construct a 2x2 Punnett square with gametes T, t and t, t.",
    category: "Genetics",
  },
  // Computer Science - High School & Undergrad
  {
    id: "cs-hs-1",
    subject: "Computer Science",
    level: "High School (Matric/O-Level)",
    question: "Convert the decimal number 157 into binary, octal, and hexadecimal representations with step-by-step division.",
    hintSnippet: "Divide repeatedly by 2, 8, and 16, keeping track of remainders from bottom to top.",
    category: "Data Representation",
  },
  {
    id: "cs-ug-1",
    subject: "Computer Science",
    level: "Undergraduate (College/University)",
    question: "Explain Dijkstra's shortest path algorithm. What is its time complexity using a min-heap, and why does it fail with negative edge weights?",
    hintSnippet: "Greedy choice assumption relies on non-negative edge relaxation invariants.",
    category: "Algorithms",
  },
  // English
  {
    id: "eng-hs-1",
    subject: "English",
    level: "High School (Matric/O-Level)",
    question: "Transform the sentence from active to passive voice: 'The committee has approved the architectural design for the new science library.'",
    hintSnippet: "The object becomes the subject: 'The architectural design... has been approved by...'",
    category: "Grammar & Syntax",
  },
  // Economics
  {
    id: "econ-hs-1",
    subject: "Economics",
    level: "High School (Matric/O-Level)",
    question: "When price rises from $10 to $12, quantity demanded falls from 100 to 70 units. Calculate price elasticity of demand using the midpoint formula.",
    hintSnippet: "PED = (% change in Q) / (% change in P) using averages as denominators.",
    category: "Microeconomics",
  },
  // Islamic Studies
  {
    id: "isl-hs-1",
    subject: "Islamic Studies",
    level: "High School (Matric/O-Level)",
    question: "Explain the significance of the Treaty of Hudaibiyyah (Sulah Hudaibiyyah) and how it proved to be a clear victory (Fath-um-Mubeen).",
    hintSnippet: "Reflect on peace pact terms, expansion of diplomatic outreach, and opening of trade/communication.",
    category: "Islamic History",
  },
  // General Knowledge
  {
    id: "gk-all-1",
    subject: "General Knowledge",
    level: "Middle School",
    question: "What causes solar and lunar eclipses, and why don't they happen every single month?",
    hintSnippet: "Consider the Moon's orbital plane inclination (~5 degrees) relative to Earth's ecliptic plane.",
    category: "Earth & Space",
  },
  // Statistics
  {
    id: "stat-int-1",
    subject: "Statistics",
    level: "Intermediate (F.Sc/A-Level)",
    question: "Given the dataset [12, 18, 22, 22, 28, 30, 36], find the mean, median, mode, sample variance, and standard deviation.",
    hintSnippet: "Sum = 168, n = 7. Variance uses division by (n - 1) for sample variance.",
    category: "Descriptive Statistics",
  },
];
