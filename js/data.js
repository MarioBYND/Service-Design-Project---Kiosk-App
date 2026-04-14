const DATA = {

  books: [
    { id: 1, title: "The art of Rome, c. 753 B.C.-337 A.D. : sources and documents", author: "J. Pollitt", year: "1966", callNumber: "N5760 .P57 1966", shelf: "Stack A", genre: "Fine Art", stack: 'A', floor: 1 },
    { id: 2, title: "Mitsou : forty images", author: "Balthus 1908-2001", year: "1984", callNumber: "NC248 .B26 A4 1984", shelf: "Stack A", genre: "Fine Art", stack: 'A', floor: 1 },
    { id: 3, title: "Sculpture as experience : working with clay, wire, wax, plaster…", author: "Judith Peck", year: "1989", callNumber: "NB1170 .P37 1989", shelf: "Stack A", genre: "Fine Art", stack: 'A', floor: 1 },
    { id: 4, title: "Architectural rendering", author: "Philip Crowe", year: "1991", callNumber: "NA2780 .C768 1991", shelf: "Stack A", genre: "Fine Art", stack: 'A', floor: 1 },
    { id: 5, title: "Hilda Morris", author: "Bruce Guenther", year: "2006", callNumber: "NB237.M625 A4 2006", shelf: "Stack A", genre: "Fine Art", stack: 'A', floor: 1 },
    { id: 6, title: "Christoph Schlingensief", author: "Christoph Schlingensief", year: "2013", callNumber: "N6888 .S35876 A4 2013", shelf: "Stack A", genre: "Fine Art", stack: 'A', floor: 1 },
    { id: 7, title: "Rethinking the forms of visual expression", author: "Robert Sowers", year: "1990", callNumber: "N7430.5 .S69 1990", shelf: "Stack A", genre: "Fine Art", stack: 'A', floor: 1 },
    { id: 8, title: "Einblicke : das 20. Jahrhundert in der Kunstsammlung Nordrhein-…", author: "Kunstsammlung Nordrhein-Westfalen", year: "2000", callNumber: "N6758 .K783 2000", shelf: "Stack A", genre: "Fine Art", stack: 'A', floor: 1 },
    { id: 9, title: "The baroque : principles, styles, modes, themes", author: "Germain Bazin", year: "1978", callNumber: "N6415 .B3 B313 1978", shelf: "Stack A", genre: "Fine Art", stack: 'A', floor: 1 },
    { id: 10, title: "Reading drawings : an introduction to looking at drawings", author: "Susan Lambert", year: "1984", callNumber: "NC715 .L35 1984", shelf: "Stack A", genre: "Fine Art", stack: 'A', floor: 1 },
    { id: 11, title: "Rembrandt", author: "Rembrandt Harmenszoon van Rijn", year: "1968", callNumber: "ND653.R4M785 1968", shelf: "Stack A", genre: "Fine Art", stack: 'A', floor: 1 },
    { id: 12, title: "Digital mosaics : the aesthetics of cyberspace", author: "Steven Holtzman", year: "1997", callNumber: "NX260 .H65 1997", shelf: "Stack A", genre: "Fine Art", stack: 'A', floor: 1 },
    { id: 13, title: "The social role of art : essays in criticism for a newspaper pu…", author: "Richard Cork", year: "1979", callNumber: "N72 .S6 C67 1979", shelf: "Stack A", genre: "Fine Art", stack: 'A', floor: 1 },
    { id: 14, title: "Otto Dix : handzeichnungen pastelle Litographien", author: "Otto Dix", year: "1976", callNumber: "ND588.D58 A4 1976", shelf: "Stack A", genre: "Fine Art", stack: 'A', floor: 1 },
    { id: 15, title: "Intaglio : acrylic-resist etching, collagraphy, engraving, dryp…", author: "Robert Adam", year: "2007", callNumber: "NE1625 .A33 2007", shelf: "Stack A", genre: "Fine Art", stack: 'A', floor: 1 },
    { id: 16, title: "Forma e crèscita nella scultura di Wertheimer", author: "Esther Wertheimer", year: "1977", callNumber: "NB249 .W47 A4 1977", shelf: "Stack A", genre: "Fine Art", stack: 'A', floor: 1 },
    { id: 17, title: "The seeing hand : a treasury of great master drawings", author: "Colin Eisler", year: "1975", callNumber: "NC37.E372", shelf: "Stack A", genre: "Fine Art", stack: 'A', floor: 1 },
    { id: 18, title: "The Moore collection in the Art Gallery of Ontario", author: "Art Gallery of Ontario", year: "1979", callNumber: "NB497.M6 W54", shelf: "Stack A", genre: "Fine Art", stack: 'A', floor: 1 },
    { id: 19, title: "Lighting for film and electronic cinematography", author: "John Viera", year: "1993", callNumber: "TR891 .V54 1993", shelf: "Stack B", genre: "Photography", stack: 'B', floor: 1 },
    { id: 20, title: "Photography and platemaking for photo-lithography", author: "Irene Sayre", year: "1959", callNumber: "TR940.S3 1959", shelf: "Stack B", genre: "Photography", stack: 'B', floor: 1 },
    { id: 21, title: "The snap-shot", author: "Jonathan Green", year: "1974", callNumber: "TR654 .G73", shelf: "Stack B", genre: "Photography", stack: 'B', floor: 1 },
    { id: 22, title: "The extraordinary landscape : aerial photographs of America", author: "William Garnett", year: "1982", callNumber: "TR660.5 .G36 1982", shelf: "Stack B", genre: "Photography", stack: 'B', floor: 1 },
    { id: 23, title: "Paris", author: "Geoffrey James", year: "2001", callNumber: "TR647 .J35 A4 2001", shelf: "Stack B", genre: "Photography", stack: 'B', floor: 1 },
    { id: 24, title: "Forget me not : photography & remembrance", author: "Geoffrey Batchen", year: "2004", callNumber: "TR646 .N4 B38 2004", shelf: "Stack B", genre: "Photography", stack: 'B', floor: 1 },
    { id: 25, title: "Acta est", author: "Lise Sarfati", year: "2000", callNumber: "TR654 .S2 2000", shelf: "Stack B", genre: "Photography", stack: 'B', floor: 1 },
    { id: 26, title: "How did they do that? : motion graphics", author: "David Greene", year: "2003", callNumber: "TR897.7 .G74 2003", shelf: "Stack B", genre: "Photography", stack: 'B', floor: 1 },
    { id: 27, title: "Posing beauty : African American images, from the 1890s to the…", author: "Deborah Willis", year: "2009", callNumber: "TR680 .W53 2009", shelf: "Stack B", genre: "Photography", stack: 'B', floor: 1 },
    { id: 28, title: "A kind of rapture", author: "Robert Bergman", year: "1998", callNumber: "TR680 .B474 1998", shelf: "Stack B", genre: "Photography", stack: 'B', floor: 1 },
    { id: 29, title: "Meanwhile", author: "Shirana Shahbazi", year: "2007", callNumber: "TR647 .S493 A4 2007", shelf: "Stack B", genre: "Photography", stack: 'B', floor: 1 },
    { id: 30, title: "The love doll : days 1-36", author: "Laurie Simmons", year: "2012", callNumber: "TR654 .S5676 L68 2012", shelf: "Stack B", genre: "Photography", stack: 'B', floor: 1 },
    { id: 31, title: "Interior space, interior design : livability and function with…", author: "Virginia Frankel", year: "1973", callNumber: "NK2004 .F72", shelf: "Stack C", genre: "Design & Craft", stack: 'C', floor: 1 },
    { id: 32, title: "Screen printing : a contemporary guide to the technique of scre…", author: "J. Biegeleisen", year: "1971", callNumber: "TT273 .B498", shelf: "Stack C", genre: "Design & Craft", stack: 'C', floor: 1 },
    { id: 33, title: "Papermaking at home : how to produce your own stationery from r…", author: "Anthony Hopkinson", year: "1978", callNumber: "TS1109 .H664", shelf: "Stack C", genre: "Design & Craft", stack: 'C', floor: 1 },
    { id: 34, title: "Mies van der Rohe, furniture and interiors", author: "Werner Blaser", year: "1982", callNumber: "NK1535.M44 B513 1982", shelf: "Stack C", genre: "Design & Craft", stack: 'C', floor: 1 },
    { id: 35, title: "The psychology of everyday things", author: "Donald Norman", year: "1988", callNumber: "TS171.4 .N67 1988", shelf: "Stack C", genre: "Design & Craft", stack: 'C', floor: 1 },
    { id: 36, title: "Critical design in context : history, theory, and practices", author: "Matthew Malpass", year: "2017", callNumber: "NK1505 .M32 2017", shelf: "Stack C", genre: "Design & Craft", stack: 'C', floor: 1 },
    { id: 37, title: "Artists' textiles in Britain, 1945-1970 : a democratic art", author: "Geoffrey Rayner", year: "2003", callNumber: "NK8843 .R39 2003", shelf: "Stack C", genre: "Design & Craft", stack: 'C', floor: 1 },
    { id: 38, title: "Awestruck, calendar of ecology : Julie Oakes", author: "Julie Oakes", year: "2015", callNumber: "NK4210 .O2 A4 2015", shelf: "Stack C", genre: "Design & Craft", stack: 'C', floor: 1 },
    { id: 39, title: "Fortuny : Mariano Fortuny, his life and work", author: "Guillermo Osma", year: "1980", callNumber: "NK1535.F675 S6 1980", shelf: "Stack C", genre: "Design & Craft", stack: 'C', floor: 1 },
    { id: 40, title: "Andrea Zittel : Sammlung Goetz", author: "Andrea Zittel", year: "2003", callNumber: "NK1412 .Z57 A4 2003", shelf: "Stack C", genre: "Design & Craft", stack: 'C', floor: 1 },
    { id: 41, title: "Full vinyl : the subversive art of designer toys", author: "Ivan Vartanian", year: "2006", callNumber: "NK8595.2 .T68 V37 2006", shelf: "Stack C", genre: "Design & Craft", stack: 'C', floor: 1 },
    { id: 42, title: "Industrial design in Britain", author: "Noel Carrington", year: "1976", callNumber: "TS57 .C37", shelf: "Stack C", genre: "Design & Craft", stack: 'C', floor: 1 },
    { id: 43, title: "War and cinema : the logistics of perception", author: "Paul Virilio", year: "1989", callNumber: "PN1995.9 .W3 V58 1989", shelf: "Stack D", genre: "Literature", stack: 'D', floor: 1 },
    { id: 44, title: "Son of a trickster", author: "Eden Robinson", year: "2018", callNumber: "PS8585 .O35143 S65 2017", shelf: "Stack D", genre: "Literature", stack: 'D', floor: 1 },
    { id: 45, title: "Draft no. 4 : on the writing process", author: "John McPhee", year: "2017", callNumber: "PN149 .M43 2017", shelf: "Stack D", genre: "Literature", stack: 'D', floor: 1 },
    { id: 46, title: "Everyone in Silico", author: "Jim Munroe", year: "2002", callNumber: "PS8576 .U5747 E94 2002", shelf: "Stack D", genre: "Literature", stack: 'D', floor: 1 },
    { id: 47, title: "Science fiction film", author: "J. Telotte", year: "2001", callNumber: "PN1995.9 .S26 T45 2001", shelf: "Stack D", genre: "Literature", stack: 'D', floor: 1 },
    { id: 48, title: "Full-metal Indigiqueer : poems", author: "Joshua Whitehead", year: "2017", callNumber: "PS8645 .H5495 F85 2017", shelf: "Stack D", genre: "Literature", stack: 'D', floor: 1 },
    { id: 49, title: "It's alright : a truckface anthology", author: "LB Briggs", year: "2013", callNumber: "PS3602 .R53162 I87 2013", shelf: "Stack D", genre: "Literature", stack: 'D', floor: 1 },
    { id: 50, title: "Multi media ritual performance : dialogues between cinema and K…", author: "Young-Hwa Cho", year: "2009", callNumber: "PN1995.9 .E96 M85 2009", shelf: "Stack D", genre: "Literature", stack: 'D', floor: 1 },
    { id: 51, title: "Cautionary tales for children", author: "Hilaire Belloc", year: "2002", callNumber: "PR6003 .E45 C34 2002", shelf: "Stack D", genre: "Literature", stack: 'D', floor: 1 },
    { id: 52, title: "Lost angels : psychoanalysis and cinema", author: "Vicky Lebeau", year: "1995", callNumber: "PN1995.9 .P783 L43 1995", shelf: "Stack D", genre: "Literature", stack: 'D', floor: 1 },
    { id: 53, title: "The Maxx", author: "Sam Kieth", year: "1996", callNumber: "PN6727 .K48 M39 1996", shelf: "Stack D", genre: "Graphic Novel", stack: 'D', floor: 1 },
    { id: 54, title: "Woman world", author: "Aminder Dhaliwal", year: "2018", callNumber: "PN6733 .D35 W66 2018", shelf: "Stack D", genre: "Graphic Novel", stack: 'D', floor: 1 },
    { id: 55, title: "The collected Toppi", author: "Sergio Toppi", year: "2019", callNumber: "PN6767 .T67 A2 2019 v.1", shelf: "Stack D", genre: "Graphic Novel", stack: 'D', floor: 1 },
    { id: 56, title: "Masterpiece comics", author: "R Sikoryak", year: "2009", callNumber: "PN6727 .S446 M38 2009", shelf: "Stack D", genre: "Graphic Novel", stack: 'D', floor: 1 },
    { id: 57, title: "Cat massage therapy. Volume 1", author: "Haru Hisakawa", year: "2021", callNumber: "PN6790 .J33 H573 2021", shelf: "Stack D", genre: "Graphic Novel", stack: 'D', floor: 1 },
    { id: 58, title: "Asterios Polyp", author: "David Mazzucchelli", year: "2009", callNumber: "PN6727 .M2476 A77 2009", shelf: "Stack D", genre: "Graphic Novel", stack: 'D', floor: 1 },
    { id: 59, title: "Virus tropical", author: "Power Paola", year: "2016", callNumber: "PN6790 .C73 P69613 2016", shelf: "Stack D", genre: "Graphic Novel", stack: 'D', floor: 1 },
    { id: 60, title: "Trauma is really strange", author: "Steve Haines", year: "2016", callNumber: "RC552 .P67 H33 2016", shelf: "Stack D", genre: "Graphic Novel", stack: 'D', floor: 1 },
    { id: 61, title: "The standard book of noun-verb exhibition grammar", author: "Niekolaas Lekkerkerk", year: "2017", callNumber: "O566 L45 S73", shelf: "Stack C", genre: "Artist's Book", stack: 'C', floor: 1 },
    { id: 62, title: "Komma : after Dalton Trumbo's Johnny got his gun", author: "Antonia Hirsch", year: "2010", callNumber: "F455 H57 K66", shelf: "Stack C", genre: "Artist's Book", stack: 'C', floor: 1 },
    { id: 63, title: "Inverted Sky : Letters to Jackie", author: "Marthe Fortun", year: "2014", callNumber: "F678 I58", shelf: "Stack C", genre: "Artist's Book", stack: 'C', floor: 1 },
    { id: 64, title: "The curious case of Gina Adams : a \"pretendian\" investigation", author: "Michelle Cyca", year: "2024", callNumber: "C933 C87", shelf: "Stack C", genre: "Artist's Book", stack: 'C', floor: 1 },
    { id: 65, title: "Miss Solitude : cuttings", author: "Birthe Piontek", year: "2017", callNumber: "P566 M57", shelf: "Stack C", genre: "Artist's Book", stack: 'C', floor: 1 },
    { id: 66, title: "The Suspension of Historical Time", author: "Furio Jesi", year: "2012", callNumber: "D638 no. 69", shelf: "Stack C", genre: "Artist's Book", stack: 'C', floor: 1 },
    { id: 67, title: "Variation sur Metropolis", author: "Maya Schweizer", year: "2006", callNumber: "O547 S39 V37", shelf: "Stack C", genre: "Artist's Book", stack: 'C', floor: 1 },
    { id: 68, title: "The more I learn about women", author: "Lisa Kereszi", year: "2014", callNumber: "K367 M67", shelf: "Stack C", genre: "Artist's Book", stack: 'C', floor: 1 },
    { id: 69, title: "Diane Maclean : lovely weather", author: "Diane Maclean", year: "2004", callNumber: "ExCat 4881", shelf: "Stack B", genre: "Exhibition Catalogue", stack: 'B', floor: 1 },
    { id: 70, title: "Radiant places : Bill Barrette and Wyn Geleynse", author: "Marnie Fleming", year: "1993", callNumber: "ExCat 6576", shelf: "Stack B", genre: "Exhibition Catalogue", stack: 'B', floor: 1 },
    { id: 71, title: "La Tauromaquia : Goya, Picasso and the bullfight", author: "Verna Curtis", year: "1986", callNumber: "ExCat 2960", shelf: "Stack B", genre: "Exhibition Catalogue", stack: 'B', floor: 1 },
    { id: 72, title: "Leucos : lampade da incasso", author: "Leucos", year: "1990", callNumber: "ExCat 4391", shelf: "Stack B", genre: "Exhibition Catalogue", stack: 'B', floor: 1 },
    { id: 73, title: "Eleanor Bond : quick aging pivoting city", author: "Eleanor Bond", year: "2000", callNumber: "ExCat 4002", shelf: "Stack B", genre: "Exhibition Catalogue", stack: 'B', floor: 1 },
    { id: 74, title: "Ed Pien", author: "Ed Pien", year: "2001", callNumber: "ExCat 4399", shelf: "Stack B", genre: "Exhibition Catalogue", stack: 'B', floor: 1 },
    { id: 75, title: "Ramboys : a bookless novel and other fictions", author: "Evergon", year: "1995", callNumber: "Excat 3393", shelf: "Stack B", genre: "Exhibition Catalogue", stack: 'B', floor: 1 },
    { id: 76, title: "Electric art", author: "Michel Proulx", year: "1977", callNumber: "Excat 3513", shelf: "Stack B", genre: "Exhibition Catalogue", stack: 'B', floor: 1 },
    { id: 77, title: "Gregory J. Markopoulos : mythic themes, portraiture and films o…", author: "John Hanhardt", year: "1996", callNumber: "ExCat 3250", shelf: "Stack B", genre: "Exhibition Catalogue", stack: 'B', floor: 1 },
    { id: 78, title: "Metrosonics", author: "National Gallery of Canada Library and Archives", year: "2009", callNumber: "ExCat 6632 no.32", shelf: "Stack B", genre: "Exhibition Catalogue", stack: 'B', floor: 1 },
    { id: 79, title: "How to kill a city : gentrification, inequality, and the fight…", author: "Peter Moskowitz", year: "2017", callNumber: "HT175 .M67 2017", shelf: "Stack E", genre: "Social Sciences", stack: 'E', floor: 1 },
    { id: 80, title: "The ecology of commerce : a declaration of sustainability", author: "Paul Hawken", year: "1993", callNumber: "HD60 .H393 1993", shelf: "Stack E", genre: "Social Sciences", stack: 'E', floor: 1 },
    { id: 81, title: "Representations of the post/human : monsters, aliens, and othe…", author: "Elaine Graham", year: "2002", callNumber: "HM846 .G73 2002", shelf: "Stack E", genre: "Social Sciences", stack: 'E', floor: 1 },
    { id: 82, title: "On super-diversity", author: "Tariq Ramadan", year: "2011", callNumber: "HM1271 .R363 2011", shelf: "Stack E", genre: "Social Sciences", stack: 'E', floor: 1 },
    { id: 83, title: "Retail desire : design, display and visual merchandising", author: "Johnny Tucker", year: "2003", callNumber: "HF5845 .T83 2003", shelf: "Stack E", genre: "Social Sciences", stack: 'E', floor: 1 },
    { id: 84, title: "Counterrevolution and revolt", author: "Herbert Marcuse", year: "1972", callNumber: "HM281 .M27 1972", shelf: "Stack E", genre: "Social Sciences", stack: 'E', floor: 1 },
    { id: 85, title: "Gay semiotics", author: "Hal Fischer", year: "2015", callNumber: "HQ76 .F53 2015", shelf: "Stack E", genre: "Social Sciences", stack: 'E', floor: 1 },
    { id: 86, title: "Fighting for Space", author: "Travis Lupick", year: "2017", callNumber: "HV5840 .C32 V36 2017", shelf: "Stack E", genre: "Social Sciences", stack: 'E', floor: 1 },
    { id: 87, title: "The last days of Greco-Roman paganism", author: "Johannes Geffcken", year: "1978", callNumber: "BR166 .G4313", shelf: "Stack E", genre: "Philosophy", stack: 'E', floor: 1 },
    { id: 88, title: "Listening : an introduction to the perception of auditory events", author: "Stephen Handel", year: "1989", callNumber: "BF251 .H27 1989", shelf: "Stack E", genre: "Philosophy", stack: 'E', floor: 1 },
    { id: 89, title: "Turn the tide on climate anxiety", author: "Megan Kennedy-Woodard", year: "2022", callNumber: "BF353.5 .C55 K46 2022", shelf: "Stack E", genre: "Philosophy", stack: 'E', floor: 1 },
    { id: 90, title: "Authority : essays", author: "Andrea Chu", year: "2025", callNumber: "BF637 .A87 C48 2025", shelf: "Stack E", genre: "Philosophy", stack: 'E', floor: 1 },
    { id: 91, title: "Zen and the art of postmodern philosophy", author: "Carl Olson", year: "2000", callNumber: "BQ9268.6 .O46 2000", shelf: "Stack E", genre: "Philosophy", stack: 'E', floor: 1 },
    { id: 92, title: "A grammar of motives", author: "Kenneth Burke", year: "1969", callNumber: "B945 .B773 G7 1969", shelf: "Stack E", genre: "Philosophy", stack: 'E', floor: 1 },
    { id: 93, title: "Critical theory and poststructuralism : in search of a context", author: "Mark Poster", year: "1989", callNumber: "B2430.F724 P67 1989", shelf: "Stack E", genre: "Philosophy", stack: 'E', floor: 1 },
    { id: 94, title: "The urban homestead : your guide to self-sufficient living in t…", author: "Kelly Coyne", year: "2010", callNumber: "GF78 .C68 2010", shelf: "Stack E", genre: "Geography & Culture", stack: 'E', floor: 1 },
    { id: 95, title: "Extreme beauty : the body transformed", author: "Harold Koda", year: "2001", callNumber: "GT503 .K634 2001", shelf: "Stack E", genre: "Geography & Culture", stack: 'E', floor: 1 },
    { id: 96, title: "Chris Crawford on interactive storytelling", author: "Chris Crawford", year: "2005", callNumber: "GV1469.17 .S86 C73 2005", shelf: "Stack E", genre: "Geography & Culture", stack: 'E', floor: 1 },
    { id: 97, title: "How to do things with videogames", author: "Ian Bogost", year: "2011", callNumber: "GV1469.34 .S52 B64 2011", shelf: "Stack E", genre: "Geography & Culture", stack: 'E', floor: 1 },
    { id: 98, title: "Material world : a global family portrait", author: "Peter Menzel", year: "1994", callNumber: "GN406 .M45 1994", shelf: "Stack E", genre: "Geography & Culture", stack: 'E', floor: 1 },
    { id: 99, title: "Earth beings : ecologies of practice across Andean worlds", author: "Marisol Cadena", year: "2015", callNumber: "GN564 .P4 C34 2015", shelf: "Stack E", genre: "Geography & Culture", stack: 'E', floor: 1 },
    { id: 100, title: "The handmade skateboard : design & build a custom longboard, cr…", author: "Matt Berger", year: "2014", callNumber: "GV859.8 .B47 2014", shelf: "Stack E", genre: "Geography & Culture", stack: 'E', floor: 1 },
  ],

  printingSteps: [
    {
      step: 1,
      title: "Connect to Library WiFi",
      body: "Make sure your device is connected to the ECUAD-Library network. Look for it in your WiFi settings — no password required.",
    },
    {
      step: 2,
      title: "Go to the Print Portal",
      body: "Open a browser and go to print.ecuad.ca, or scan the QR code posted on the printer. Log in with your ECUAD student ID.",
    },
    {
      step: 3,
      title: "Upload Your Document",
      body: "Tap 'Upload File' and select your document. Supported formats: PDF, DOCX, JPEG, PNG. Maximum file size is 50 MB.",
    },
    {
      step: 4,
      title: "Choose Print Settings",
      body: "Select colour or black & white, number of copies, and paper size (Letter is default). Colour costs $0.25/page, B&W is $0.10/page.",
    },
    {
      step: 5,
      title: "Confirm and Pay",
      body: "Review your job and tap 'Send to Printer'. Payment is deducted from your print balance. Top up at the Library Desk with cash or card.",
    },
    {
      step: 6,
      title: "Collect Your Print",
      body: "Walk to the printer near the main Library entrance. Tap your student card on the reader and your job will print. Jobs expire after 24 hours.",
    },
  ],

  chargingSpots: [
    { id: 1, name: "Main Reading Room",  description: "8 outlets along the window wall. Power bars under every window seat.", mapZone: "zone-a", seats: 8,  active: true,  wayfindingRoom: 'room-6' },
    { id: 2, name: "Lounge Seating",     description: "Floor outlets between the soft chairs near the magazine rack. 4 outlets total.", mapZone: "zone-d", seats: 4,  active: true,  wayfindingRoom: 'room-7' },
    { id: 3, name: "Quiet Study Area",   description: "USB-A and USB-C ports built into each study carrel. Located near the east stairwell.", mapZone: "zone-b", seats: 6,  active: false, wayfindingRoom: null },
    { id: 4, name: "Group Study Room 1", description: "Power bar on the central table. Book the room at the Library Desk.", mapZone: "zone-c", seats: 4,  active: false, wayfindingRoom: null },
    { id: 5, name: "Group Study Room 2", description: "Power bar on the central table. Book the room at the Library Desk.", mapZone: "zone-c", seats: 4,  active: false, wayfindingRoom: null },
    { id: 6, name: "Computer Lab",       description: "Every workstation has USB-A charging built in. Open access during Library hours.", mapZone: "zone-e", seats: 12, active: false, wayfindingRoom: null },
  ],

  // ── Inline SVG: Library Stacks Map ──────────────────────────────────
  // Sections A–G. JS adds class "active" to <g id="sec-X"> children
  // to highlight the matching section via CSS (.sf.active, .sl.active).
  svgStacksMap: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 308" style="display:block;width:100%;height:auto">
  <defs>
    <style>
      .sf { fill: #f2f2f2; stroke: #ccc; stroke-width: 1.5; }
      .sf.active { fill: #00af81; stroke: #008f68; }
      .sl { font: 900 20px 'Barlow Condensed','Helvetica Neue',sans-serif; fill: #aaa; text-anchor: middle; dominant-baseline: middle; }
      .sl.active { fill: #fff; }
      .sh { stroke: rgba(0,0,0,0.06); stroke-width: 1; }
      .fl { font: 700 9px 'Barlow','Helvetica Neue',sans-serif; fill: #bbb; letter-spacing: 1.5px; }
      .ent { font: 700 9px 'Barlow','Helvetica Neue',sans-serif; fill: #ccc; text-anchor: middle; letter-spacing: 1.5px; }
    </style>
  </defs>

  <!-- Floor 2 -->
  <text x="22" y="13" class="fl">FLOOR 2</text>

  <!-- Section A: x=22 w=72 -->
  <g id="sec-A">
    <rect x="22" y="20" width="72" height="182" rx="3" class="sf"/>
    <line x1="22" y1="42" x2="94" y2="42" class="sh"/>
    <line x1="22" y1="64" x2="94" y2="64" class="sh"/>
    <line x1="22" y1="86" x2="94" y2="86" class="sh"/>
    <line x1="22" y1="108" x2="94" y2="108" class="sh"/>
    <line x1="22" y1="130" x2="94" y2="130" class="sh"/>
    <line x1="22" y1="152" x2="94" y2="152" class="sh"/>
    <line x1="22" y1="174" x2="94" y2="174" class="sh"/>
    <text x="58" y="111" class="sl">A</text>
  </g>

  <!-- Section B: x=103 w=72 -->
  <g id="sec-B">
    <rect x="103" y="20" width="72" height="182" rx="3" class="sf"/>
    <line x1="103" y1="42" x2="175" y2="42" class="sh"/>
    <line x1="103" y1="64" x2="175" y2="64" class="sh"/>
    <line x1="103" y1="86" x2="175" y2="86" class="sh"/>
    <line x1="103" y1="108" x2="175" y2="108" class="sh"/>
    <line x1="103" y1="130" x2="175" y2="130" class="sh"/>
    <line x1="103" y1="152" x2="175" y2="152" class="sh"/>
    <line x1="103" y1="174" x2="175" y2="174" class="sh"/>
    <text x="139" y="111" class="sl">B</text>
  </g>

  <!-- Section C: x=184 w=72 -->
  <g id="sec-C">
    <rect x="184" y="20" width="72" height="182" rx="3" class="sf"/>
    <line x1="184" y1="42" x2="256" y2="42" class="sh"/>
    <line x1="184" y1="64" x2="256" y2="64" class="sh"/>
    <line x1="184" y1="86" x2="256" y2="86" class="sh"/>
    <line x1="184" y1="108" x2="256" y2="108" class="sh"/>
    <line x1="184" y1="130" x2="256" y2="130" class="sh"/>
    <line x1="184" y1="152" x2="256" y2="152" class="sh"/>
    <line x1="184" y1="174" x2="256" y2="174" class="sh"/>
    <text x="220" y="111" class="sl">C</text>
  </g>

  <!-- Section D: x=265 w=72 -->
  <g id="sec-D">
    <rect x="265" y="20" width="72" height="182" rx="3" class="sf"/>
    <line x1="265" y1="42" x2="337" y2="42" class="sh"/>
    <line x1="265" y1="64" x2="337" y2="64" class="sh"/>
    <line x1="265" y1="86" x2="337" y2="86" class="sh"/>
    <line x1="265" y1="108" x2="337" y2="108" class="sh"/>
    <line x1="265" y1="130" x2="337" y2="130" class="sh"/>
    <line x1="265" y1="152" x2="337" y2="152" class="sh"/>
    <line x1="265" y1="174" x2="337" y2="174" class="sh"/>
    <text x="301" y="111" class="sl">D</text>
  </g>

  <!-- Section E: x=346 w=72 -->
  <g id="sec-E">
    <rect x="346" y="20" width="72" height="182" rx="3" class="sf"/>
    <line x1="346" y1="42" x2="418" y2="42" class="sh"/>
    <line x1="346" y1="64" x2="418" y2="64" class="sh"/>
    <line x1="346" y1="86" x2="418" y2="86" class="sh"/>
    <line x1="346" y1="108" x2="418" y2="108" class="sh"/>
    <line x1="346" y1="130" x2="418" y2="130" class="sh"/>
    <line x1="346" y1="152" x2="418" y2="152" class="sh"/>
    <line x1="346" y1="174" x2="418" y2="174" class="sh"/>
    <text x="382" y="111" class="sl">E</text>
  </g>

  <!-- Floor 3 -->
  <text x="22" y="218" class="fl">FLOOR 3</text>

  <!-- Section F: x=22 w=100 -->
  <g id="sec-F">
    <rect x="22" y="226" width="100" height="58" rx="3" class="sf"/>
    <line x1="22" y1="245" x2="122" y2="245" class="sh"/>
    <line x1="22" y1="264" x2="122" y2="264" class="sh"/>
    <line x1="22" y1="283" x2="122" y2="283" class="sh"/>
    <text x="72" y="255" class="sl">F</text>
  </g>

  <!-- Section G: x=132 w=100 -->
  <g id="sec-G">
    <rect x="132" y="226" width="100" height="58" rx="3" class="sf"/>
    <line x1="132" y1="245" x2="232" y2="245" class="sh"/>
    <line x1="132" y1="264" x2="232" y2="264" class="sh"/>
    <line x1="132" y1="283" x2="232" y2="283" class="sh"/>
    <text x="182" y="255" class="sl">G</text>
  </g>

  <!-- Entrance -->
  <text x="220" y="302" class="ent">▲ ENTRANCE</text>
</svg>`,

  // ── Inline SVG: Charging Spots Map ──────────────────────────────────
  // Zone dots have id="dot-zone-X". JS changes dot fill on selection.
  svgChargingMap: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 232" style="display:block;width:100%;height:auto">
  <defs>
    <style>
      .rm { fill: #f2f2f2; stroke: #ccc; stroke-width: 1.5; }
      .rl { font: 600 9px 'Barlow','Helvetica Neue',sans-serif; fill: #bbb; text-anchor: middle; letter-spacing: 0.5px; }
      .zdot { fill: #b4d000; stroke: #8fa000; stroke-width: 1.5; }
      .zlbl { font: 900 12px 'Barlow Condensed','Helvetica Neue',sans-serif; fill: #333; text-anchor: middle; dominant-baseline: central; }
      .leg  { font: 600 9px 'Barlow','Helvetica Neue',sans-serif; fill: #aaa; letter-spacing: 0.5px; }
      .ent  { font: 700 9px 'Barlow','Helvetica Neue',sans-serif; fill: #ccc; text-anchor: middle; letter-spacing: 1.5px; }
    </style>
  </defs>

  <!-- Main Reading Room (zone-a) -->
  <rect x="10" y="10" width="190" height="95" rx="4" class="rm"/>
  <text x="105" y="60" class="rl">MAIN READING ROOM</text>
  <circle cx="68" cy="76" r="13" class="zdot" id="dot-zone-a"/>
  <text x="68" y="76" class="zlbl">A</text>

  <!-- Quiet Study (zone-b) -->
  <rect x="210" y="10" width="110" height="95" rx="4" class="rm"/>
  <text x="265" y="53" class="rl">QUIET</text>
  <text x="265" y="65" class="rl">STUDY</text>
  <circle cx="265" cy="84" r="13" class="zdot" id="dot-zone-b"/>
  <text x="265" y="84" class="zlbl">B</text>

  <!-- Group Study Room 1 (zone-c) -->
  <rect x="330" y="10" width="100" height="44" rx="4" class="rm"/>
  <text x="380" y="28" class="rl">STUDY RM 1</text>
  <circle cx="380" cy="42" r="11" class="zdot" id="dot-zone-c"/>
  <text x="380" y="42" class="zlbl">C</text>

  <!-- Group Study Room 2 (same zone-c dot, shared) -->
  <rect x="330" y="62" width="100" height="43" rx="4" class="rm"/>
  <text x="380" y="82" class="rl">STUDY RM 2</text>

  <!-- Lounge (zone-d) -->
  <rect x="10" y="115" width="130" height="80" rx="4" class="rm"/>
  <text x="75" y="150" class="rl">LOUNGE</text>
  <circle cx="75" cy="167" r="13" class="zdot" id="dot-zone-d"/>
  <text x="75" y="167" class="zlbl">D</text>

  <!-- Computer Lab (zone-e) -->
  <rect x="150" y="115" width="280" height="80" rx="4" class="rm"/>
  <text x="290" y="150" class="rl">COMPUTER LAB</text>
  <circle cx="245" cy="167" r="13" class="zdot" id="dot-zone-e"/>
  <text x="245" y="167" class="zlbl">E</text>

  <!-- Entrance -->
  <rect x="170" y="200" width="100" height="26" rx="3" fill="#f8f8f8" stroke="#ddd" stroke-width="1"/>
  <text x="220" y="216" class="ent">ENTRANCE</text>

  <!-- Legend -->
  <circle cx="14" cy="226" r="5" fill="#b4d000" stroke="#8fa000" stroke-width="1"/>
  <text x="24" y="229" class="leg">= Charging available</text>
</svg>`,

};
