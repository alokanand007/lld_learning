/**
 * LLD Practice Platform — Problem Definitions
 * 
 * Each problem contains real-world specifications, explicit functional requirements,
 * edge cases to consider, and architectural guidance for object-oriented design.
 */

export const PROBLEMS = [
  {
    id: "parking-lot",
    title: "Parking Lot System",
    difficulty: "Intermediate",
    estimatedTime: "30 min",
    category: "Real-World Resource Allocation",
    tags: ["OOP", "Strategy Pattern", "State Pattern", "Concurrency"],
    description: "Design a multi-floor parking lot management system capable of assigning available spots to various vehicle types, tracking occupancy, issuing tickets, and calculating dynamic parking fees.",
    summary: "Manage multi-level parking spots, handle entrance ticketing, vehicle type assignment, and exit fee computation.",
    requirements: [
      "The parking lot consists of multiple floors, each containing multiple parking spots with different sizes (e.g., Compact, Large, Handicapped, Motorcycle).",
      "Support multiple vehicle types: Motorcycle, Car, Van, Electric Car, and Truck. Each vehicle must occupy an appropriate spot type.",
      "An automated entrance gate issues a timed parking ticket when a vehicle enters and assigns the nearest available spot.",
      "An automated exit gate accepts tickets, calculates parking duration, processes payments based on customizable hourly rates, and marks the spot as vacant.",
      "Support multiple entry and exit panels concurrently without race conditions when assigning the last available spot.",
      "Provide real-time display boards at each entrance showing the count of free spots per vehicle type per floor.",
      "Extensibility: Allow flexible pricing strategies (e.g., peak-hour surge, flat rate, electric vehicle charging surcharge)."
    ],
    designGuidance: {
      keyClasses: [
        "ParkingLot (Singleton/Coordinator)",
        "ParkingFloor",
        "ParkingSpot (Abstract/Subclasses: CompactSpot, LargeSpot, etc.)",
        "Vehicle (Abstract/Subclasses: Car, Truck, Motorcycle)",
        "ParkingTicket",
        "EntranceGate / ExitGate",
        "PaymentStrategy / PricingStrategy",
        "DisplayBoard"
      ],
      responsibilities: [
        "ParkingLot: Coordinates floors, gates, and delegates spot search.",
        "ParkingFloor: Maintains spot collections and counts vacant spots per type.",
        "ParkingSpot: Tracks its own occupancy state, spot type, and currently assigned vehicle.",
        "PricingStrategy: Encapsulates fee calculation algorithm independently from ticket lifecycle.",
        "EntrancePanel / ExitPanel: Handles ticket printing and checkout orchestration."
      ],
      relationships: [
        "ParkingLot has-a collection of ParkingFloor (1-to-many composition).",
        "ParkingFloor has-a collection of ParkingSpot (1-to-many composition).",
        "ParkingSpot has-a reference to Vehicle (association, 1-to-0..1).",
        "ParkingTicket links Vehicle to ParkingSpot with timestamp metadata.",
        "ExitGate uses PricingStrategy to compute fee (Strategy Pattern)."
      ],
      extensibilityPoints: [
        "Adding new vehicle types or spots should not modify existing parking search logic (Open-Closed Principle).",
        "Dynamic pricing rules can be hot-swapped via Strategy Pattern.",
        "EV charging spot management can extend ParkingSpot without altering regular spot semantics."
      ],
      recommendedPatterns: [
        "Singleton: For global ParkingLot manager instance",
        "Strategy Pattern: For flexible fee calculation algorithms",
        "Factory Method: For instantiating vehicle-appropriate spots and tickets",
        "Observer Pattern: For notifying entrance display boards when spots become vacant/occupied"
      ]
    },
    starterTemplate: {
      classes: `ParkingLot\nParkingFloor\nParkingSpot\nVehicle\nCar\nTruck\nMotorcycle\nParkingTicket\nPricingStrategy\nHourlyPricingStrategy`,
      responsibilities: `ParkingLot:\n- Coordinates parking floors and gates\n- Delegates nearest spot allocation\n\nParkingFloor:\n- Manages a collection of ParkingSpots\n- Tracks available spot counts per type\n\nParkingSpot:\n- Tracks availability status and vehicle fit\n\nVehicle:\n- Encapsulates vehicle type and license plate\n\nParkingTicket:\n- Records entry timestamp, spot assigned, and exit fee\n\nPricingStrategy:\n- Calculates parking fee based on duration and vehicle type`,
      relationships: `ParkingLot 1 --> * ParkingFloor (Composition)\nParkingFloor 1 --> * ParkingSpot (Composition)\nParkingSpot 1 --> 0..1 Vehicle (Association)\nParkingTicket --> Vehicle & ParkingSpot (Association)\nParkingLot --> PricingStrategy (Dependency Injection)`,
      code: `// Interface & Class Outlines\nenum VehicleType { MOTORCYCLE, CAR, TRUCK }\nenum SpotType { MOTORCYCLE, COMPACT, LARGE }\n\nclass Vehicle {\n  private String licensePlate;\n  private VehicleType type;\n  // constructor, getters\n}\n\nabstract class ParkingSpot {\n  private String id;\n  private boolean isOccupied;\n  private Vehicle vehicle;\n  \n  public abstract boolean canFitVehicle(Vehicle vehicle);\n  public void assignVehicle(Vehicle v) { this.vehicle = v; this.isOccupied = true; }\n  public void vacate() { this.vehicle = null; this.isOccupied = false; }\n}\n\nclass ParkingFloor {\n  private int floorNumber;\n  private List<ParkingSpot> spots;\n  public Optional<ParkingSpot> findAvailableSpot(Vehicle vehicle) { /* ... */ }\n}\n\ninterface PricingStrategy {\n  double calculateAmount(ParkingTicket ticket, Instant exitTime);\n}\n\nclass ParkingLot {\n  private static ParkingLot instance;\n  private List<ParkingFloor> floors;\n  private PricingStrategy pricingStrategy;\n  \n  public ParkingTicket enterVehicle(Vehicle v) { /* allocate spot, generate ticket */ }\n  public double exitVehicle(ParkingTicket ticket) { /* release spot, calculate fee */ }\n}`
    }
  },
  {
    id: "vending-machine",
    title: "Vending Machine System",
    difficulty: "Beginner",
    estimatedTime: "25 min",
    category: "Finite State Machine",
    tags: ["State Pattern", "OOP", "Encapsulation", "Inventory"],
    description: "Design an automated vending machine that accepts cash or card payments, dispenses selected snacks/drinks, handles stock management, returns change, and safely transitions between operational states.",
    summary: "Handle state transitions (Idle, Ready, Dispensing, Out of Order), inventory tracking, and change dispensing.",
    requirements: [
      "The machine holds products in numbered slots (rows and columns). Each product has a code, name, price, and available quantity.",
      "The user can insert cash (coins/bills) or select digital card payment.",
      "Support standard operational states: IdleState (awaiting coin), HasMoneyState (item selection), DispensingState, and SoldOutState.",
      "When a valid product is chosen with sufficient funds, dispense the product and return remaining change in optimal denominations.",
      "Allow the customer to cancel the transaction at any point before dispensing and receive a full refund.",
      "Provide an administrative interface for maintenance: refilling items, collecting cash, and taking machine out of order.",
      "Prevent race conditions if multiple users press buttons simultaneously or if an item runs out during transaction."
    ],
    designGuidance: {
      keyClasses: [
        "VendingMachine (Context)",
        "VendingMachineState (State Interface)",
        "IdleState, HasMoneyState, DispenseState, SoldOutState (Concrete States)",
        "Product",
        "Inventory / Slot",
        "Coin / Bill (Currency)",
        "ChangeDispenser"
      ],
      responsibilities: [
        "VendingMachine: Holds context, current state, current balance, and inventory.",
        "VendingMachineState: Defines contract for insertMoney(), selectProduct(), dispense(), cancel().",
        "Inventory: Tracks quantities per item code and validates availability.",
        "ChangeDispenser: Calculates denomination breakdown for change return."
      ],
      relationships: [
        "VendingMachine has-a VendingMachineState (State Pattern, 1-to-1).",
        "VendingMachine has-a Inventory (Composition).",
        "Inventory has-a collection of ProductSlots (1-to-many).",
        "States delegate transitions back to VendingMachine context."
      ],
      extensibilityPoints: [
        "Adding new states (e.g., MaintenanceState, UPIPaymentState) without altering existing state classes.",
        "Supporting new payment methods via Strategy Pattern."
      ],
      recommendedPatterns: [
        "State Pattern: Crucial for managing state transitions cleanly without sprawling if-else or switch statements",
        "Strategy Pattern: For change calculation or payment processing",
        "Command Pattern: Optional, for handling button input operations"
      ]
    },
    starterTemplate: {
      classes: `VendingMachine\nVendingState (Interface)\nIdleState\nHasMoneyState\nDispensingState\nSoldOutState\nProduct\nInventory\nCoin`,
      responsibilities: `VendingMachine:\n- Holds current operational state, inserted balance, and inventory\n- Exposes methods called by states to update balance and change state\n\nVendingState:\n- Defines behaviors for insertMoney, selectProduct, dispense, and cancelTransaction\n\nInventory:\n- Tracks stock levels per slot and dispenses items upon request`,
      relationships: `VendingMachine 1 --> 1 VendingState (Composition & Delegation)\nVendingState --> VendingMachine (Context pointer)\nVendingMachine 1 --> 1 Inventory (Composition)\nInventory 1 --> * Product (Composition)`,
      code: `interface VendingState {\n  void insertMoney(VendingMachine context, double amount);\n  void selectItem(VendingMachine context, String code);\n  void dispense(VendingMachine context);\n  void cancel(VendingMachine context);\n}\n\nclass IdleState implements VendingState {\n  public void insertMoney(VendingMachine context, double amount) {\n    context.addBalance(amount);\n    context.setState(new HasMoneyState());\n  }\n  // selectItem & dispense reject in idle\n}\n\nclass VendingMachine {\n  private VendingState currentState;\n  private double currentBalance;\n  private Inventory inventory;\n  \n  public void setState(VendingState state) { this.currentState = state; }\n  public void insertMoney(double amt) { currentState.insertMoney(this, amt); }\n  public void selectItem(String code) { currentState.selectItem(this, code); }\n}`
    }
  },
  {
    id: "elevator-system",
    title: "Elevator Control System",
    difficulty: "Intermediate",
    estimatedTime: "35 min",
    category: "Dispatching & Scheduling",
    tags: ["Dispatcher", "Scheduling", "LOOK/SCAN", "State Pattern"],
    description: "Design a controller for a bank of multiple elevators in a high-rise building, optimizing for waiting time, power efficiency, direction of travel, and emergency overrides.",
    summary: "Schedule elevator cars, dispatch requests from floor and cabin panels, and manage movement states.",
    requirements: [
      "The building has N floors and M elevator cars operating simultaneously.",
      "Passengers can request an elevator from any floor indicating desired direction (UP or DOWN).",
      "Passengers inside an elevator cabin can press buttons to specify destination floor(s).",
      "An Elevator Controller/Dispatcher receives all external and internal requests and schedules the optimal car using algorithms like SCAN/LOOK or nearest-car heuristics.",
      "Each car has physical constraints: maximum weight capacity, door open/close timeouts, and current movement state (MOVING_UP, MOVING_DOWN, IDLE, MAINTENANCE).",
      "Elevator cars must handle emergency stop signals and fire alarm overrides by immediately routing to the ground floor.",
      "The dispatching strategy must be decoupled from physical elevator car operations so new dispatching algorithms can be tested."
    ],
    designGuidance: {
      keyClasses: [
        "ElevatorController / Dispatcher",
        "ElevatorCar",
        "DispatchStrategy (Interface: SCANStrategy, ProximityStrategy)",
        "InternalPanel / ExternalPanel",
        "ElevatorRequest (HallRequest vs CabinRequest)",
        "Door",
        "Direction (UP, DOWN, IDLE)"
      ],
      responsibilities: [
        "ElevatorController: Central dispatcher listening to floor requests and delegating to ElevatorCars.",
        "ElevatorCar: Manages cabin state, current floor, passenger requests queue, and door state.",
        "DispatchStrategy: Pure algorithmic logic computing cost/fitness of each car for a new request.",
        "ElevatorRequest: Immutable value object representing source floor, direction, and target."
      ],
      relationships: [
        "ElevatorController has-a collection of ElevatorCar (1-to-many).",
        "ElevatorController uses DispatchStrategy (Strategy Pattern).",
        "ExternalPanel sends HallRequest to ElevatorController.",
        "InternalPanel sends CabinRequest directly to its parent ElevatorCar."
      ],
      extensibilityPoints: [
        "Swap between Simple FCFS, LOOK algorithm, or Energy-Saver Dispatcher without changing car mechanics.",
        "Add VIP service or express elevators servicing only specific floors."
      ],
      recommendedPatterns: [
        "Strategy Pattern: For elevator scheduling algorithms",
        "Observer Pattern: For panels broadcasting button press events to controller",
        "State Pattern: For ElevatorCar status transitions (IDLE, MOVING, STOPPED, EMERGENCY)"
      ]
    },
    starterTemplate: {
      classes: `ElevatorController\nElevatorCar\nDispatchStrategy\nScanDispatchStrategy\nHallRequest\nCabinRequest\nDoor\nDirection`,
      responsibilities: `ElevatorController:\n- Coordinates elevator fleet and routes external hall calls to best car\n\nElevatorCar:\n- Handles local movement, floor stops, and door open/close cycles\n\nDispatchStrategy:\n- Evaluates car availability and cost metric for pending hall requests`,
      relationships: `ElevatorController 1 --> * ElevatorCar (Aggregation)\nElevatorController 1 --> 1 DispatchStrategy (Strategy Pattern)\nElevatorCar 1 --> 1 Door (Composition)\nElevatorCar 1 --> * CabinRequest (Queue)`,
      code: `enum Direction { UP, DOWN, IDLE }\nenum CarStatus { MOVING, STOPPED, MAINTENANCE }\n\nclass HallRequest {\n  int floor;\n  Direction direction;\n}\n\ninterface DispatchStrategy {\n  ElevatorCar selectBestCar(List<ElevatorCar> cars, HallRequest request);\n}\n\nclass ElevatorCar {\n  private int id;\n  private int currentFloor;\n  private Direction direction;\n  private TreeSet<Integer> destinationFloors;\n  \n  public void moveToNext() { /* step floor */ }\n  public void addStop(int floor) { destinationFloors.add(floor); }\n}\n\nclass ElevatorController {\n  private List<ElevatorCar> cars;\n  private DispatchStrategy strategy;\n  \n  public void handleHallRequest(HallRequest req) {\n    ElevatorCar best = strategy.selectBestCar(cars, req);\n    best.addStop(req.floor);\n  }\n}`
    }
  },
  {
    id: "library-management",
    title: "Library Management System",
    difficulty: "Beginner",
    estimatedTime: "20 min",
    category: "Cataloging & Lending",
    tags: ["Cataloging", "Search", "Lending Policy", "Fine Calculation"],
    description: "Design a comprehensive library system that manages book inventory, tracks loans to members, handles catalog search across multiple attributes, and computes late return fines.",
    summary: "Track physical book copies (BookItem), support multi-criteria search, enforce borrowing limits and overdue fines.",
    requirements: [
      "A library contains Books with multiple physical BookItems (each with a unique barcode).",
      "Books have metadata: ISBN, Title, Subject, Author, and Publication Date.",
      "System supports two main user types: Members (can borrow, renew, reserve) and Librarians (can add books, register members, cancel memberships).",
      "Members have borrowing limits (e.g., maximum 5 books borrowed simultaneously for up to 14 days).",
      "Provide flexible book search capabilities: search by title, author, subject, or publication date.",
      "Calculate fine rates automatically for items returned past the due date.",
      "Members can reserve a book item if all copies are currently checked out; notifications are sent when a reserved copy is returned."
    ],
    designGuidance: {
      keyClasses: [
        "Library (Singleton/System Facade)",
        "Book & BookItem (Separation of conceptual book vs physical copy)",
        "Catalog (Search Index)",
        "Member & Librarian (Inheriting from Account/User)",
        "BookLending (Loan record with dueDate and returnDate)",
        "Fine & FinePolicy",
        "BookReservation"
      ],
      responsibilities: [
        "Book vs BookItem: Separates shared metadata (ISBN, title) from physical state (barcode, status, rack location).",
        "Catalog: Implements search index by Author, Title, Category.",
        "BookLending: Tracks loan checkout timestamp, due date, and fine status.",
        "FinePolicy: Encapsulates day-rate calculation and grace period logic."
      ],
      relationships: [
        "Book 1 --> * BookItem (Composition, 1 title has many physical copies).",
        "Member 1 --> * BookLending (1-to-many loan records).",
        "BookLending references BookItem and Member.",
        "Library has-a Catalog and AccountRepository."
      ],
      extensibilityPoints: [
        "Easily add new search filters without rewriting catalog storage.",
        "Different fine calculation rules for different item categories (e.g., Rare Reference Books vs Paperbacks)."
      ],
      recommendedPatterns: [
        "Facade Pattern: Library class acts as high-level facade for members and librarians",
        "Strategy Pattern: For dynamic fine calculation rules",
        "Factory Pattern: For account and lending record creation"
      ]
    },
    starterTemplate: {
      classes: `Library\nBook\nBookItem\nCatalog\nMember\nLibrarian\nBookLending\nFinePolicy`,
      responsibilities: `Book:\n- Stores immutable title, author, ISBN metadata\n\nBookItem:\n- Physical copy with unique barcode and lending status (Available, Borrowed, Lost)\n\nCatalog:\n- Facilitates search queries across book collection\n\nMember:\n- Borrows and returns book items within allocation limit\n\nFinePolicy:\n- Computes overdue fee per elapsed day past return deadline`,
      relationships: `Book 1 --> * BookItem (Composition)\nMember 1 --> * BookLending (Association)\nBookLending --> BookItem (Association)\nLibrary 1 --> 1 Catalog (Composition)`,
      code: `enum BookStatus { AVAILABLE, BORROWED, RESERVED, LOST }\n\nclass Book {\n  private String isbn;\n  private String title;\n  private List<String> authors;\n}\n\nclass BookItem {\n  private String barcode;\n  private Book book;\n  private BookStatus status;\n  private String rackLocation;\n}\n\nclass BookLending {\n  private String lendingId;\n  private BookItem item;\n  private Member member;\n  private LocalDate checkoutDate;\n  private LocalDate dueDate;\n  private LocalDate returnDate;\n}\n\nclass Catalog {\n  private Map<String, List<Book>> booksByTitle;\n  private Map<String, List<Book>> booksByAuthor;\n  public List<Book> searchByTitle(String query) { /* ... */ }\n}`
    }
  }
];

export function getProblemById(id) {
  return PROBLEMS.find(p => p.id === id) || null;
}
