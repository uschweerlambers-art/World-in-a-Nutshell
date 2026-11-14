# Builds site/data/discover.json, the curated "Discover here" tips of the place popup (F-25).
#
# Usage: python3 tools/discover-tips.py
#
# Every tip names a real place with its own English Wikipedia article. The photo is taken by the
# GitHub Action (scripts/fetch-discover-pictures.mjs) from that article, only from Wikimedia Commons
# with a free licence, so it shows the place itself. Texts are our own words.
# kind: sight (landmark or local speciality), person (a person's story tied to a place), surprise (unexpected, may lie outside the city)
# The city anchor (lat/lon) comes from site/data/places.json, so the popup finds the tips by distance.
import json, os, re, unicodedata

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

C = []
def city(name, cc, r=12):
    C.append({'name': name, 'cc': cc, 'r': r, 'tips': []})
def tip(kind, title, wiki, lat, lon, text, more, person=None, photo=None, avoid=None):
    t = {'kind': kind, 'title': title, 'wiki': wiki, 'lat': lat, 'lon': lon, 'text': text, 'more': more}
    if person: t['person'] = person
    if photo: t['photo'] = photo
    if avoid: t['avoid'] = avoid  # Commons files that do not show the place itself
    C[-1]['tips'].append(t)

# ---------- Germany ----------
city('Bielefeld', 'DE')
tip('sight', 'Sparrenburg', 'Sparrenburg', 52.0141, 8.5266,
    'A 13th-century castle on the ridge above the old town, built by the Counts of Ravensberg.',
    'Its tower looks out over the city and the Teutoburg Forest. Below the walls, old passages run through the hill.')
tip('person', 'Kunsthalle Bielefeld', 'Kunsthalle Bielefeld', 52.0157, 8.5296,
    'The American architect Philip Johnson designed this red sandstone museum, opened in 1968.',
    'Johnson, famous for his Glass House in Connecticut, built very little in Europe. The Kunsthalle shows modern and contemporary art, with sculptures in the park beside it.',
    person='Philip Johnson')
tip('surprise', 'Externsteine', 'Externsteine', 51.8687, 8.9172,
    'Sandstone pillars rising out of the Teutoburg Forest, with a relief carved into the rock almost 900 years ago.',
    'Steps and a small chapel are cut into the rock, and a bridge links two of the pillars. A good outing from Bielefeld.')

city('Berlin', 'DE', 25)
tip('sight', 'Berlin Wall Memorial', 'Berlin Wall Memorial', 52.5353, 13.3903,
    'The last stretch of the Wall with its death strip intact, along Bernauer Strasse.',
    'The houses on this street stood right on the border, and in 1961 people jumped from their windows to the West. A viewing tower looks over the preserved border strip.')
tip('person', 'Einstein Tower', 'Einstein Tower', 52.3787, 13.0634,
    'An observatory built around 1920 to test Albert Einstein’s theory of relativity.',
    'Erich Mendelsohn’s curved tower on the Telegrafenberg in Potsdam became an icon of expressionist architecture. It still holds a solar telescope.',
    person='Albert Einstein')
tip('surprise', 'Tempelhofer Feld', 'Tempelhofer Feld', 52.4731, 13.4031,
    'An airport in the middle of the city that closed in 2008; its runways are now a park for everyone.',
    'People cycle, skate and fly kites on the old runways. During the Berlin Airlift of 1948–49 the planes supplying West Berlin landed here.')

city('Hamburg', 'DE', 20)
tip('sight', 'Elbphilharmonie', 'Elbphilharmonie', 53.5413, 9.9841,
    'A concert hall rising like a glass wave out of an old brick warehouse in the harbour.',
    'Its public viewing platform, the Plaza, sits 37 metres up between the old warehouse and the new glass building and is open to everyone.')
tip('person', 'Beatles-Platz', 'Beatles-Platz', 53.5498, 9.9578,
    'Before they were famous, the Beatles played hundreds of nights in the clubs of the Grosse Freiheit, right here.',
    'Between 1960 and 1962 they performed at the Indra, the Kaiserkeller, the Top Ten and the Star-Club. The round square at the corner of the Reeperbahn remembers them with steel figures.',
    person='The Beatles')
tip('surprise', 'Old Elbe Tunnel', 'Old Elbe Tunnel', 53.5459, 9.9665,
    'Lifts big enough for cars take you 24 metres down to a tiled tunnel under the Elbe, opened in 1911.',
    'Walk through it to the other bank and look back at the harbour and the Landungsbrücken.')

city('Munich', 'DE', 20)
tip('sight', 'Viktualienmarkt', 'Viktualienmarkt', 48.1351, 11.5763,
    'Munich’s open-air food market since 1807, with a maypole in the middle and a beer garden.',
    'Stalls sell fruit, cheese, flowers and Bavarian specialities a few steps from Marienplatz.')
tip('person', 'Lenbachhaus', 'Lenbachhaus', 48.1468, 11.5638,
    'This villa museum holds the largest collection of the Blue Rider, the artists around Wassily Kandinsky and Franz Marc.',
    'Many of the works were a gift from Gabriele Münter, who hid them from the Nazis in her house in Murnau and gave them to the city in 1957.',
    person='Gabriele Münter')
tip('surprise', 'Olympiapark', 'Olympiapark, Munich', 48.1731, 11.5466,
    'The park of the 1972 Olympic Games, with transparent tent roofs and a hill made of wartime rubble.',
    'From the top of the Olympiaberg the view reaches the Alps on clear days.')

city('Cologne', 'DE', 15)
tip('sight', 'Cologne Cathedral', 'Cologne Cathedral', 50.9413, 6.9583,
    'Building began in 1248 and was only finished in 1880; for a few years it was the tallest building in the world.',
    '533 steps lead up the south tower to a view over the Rhine. Inside stands the golden Shrine of the Three Kings.')
tip('sight', 'Museum Ludwig', 'Museum Ludwig', 50.9409, 6.9606,
    'Right next to the cathedral, one of the largest collections of Pop Art outside the United States.',
    'It also holds one of the biggest Picasso collections in Europe.')
tip('surprise', 'Hohenzollern Bridge', 'Hohenzollern Bridge', 50.9413, 6.9658,
    'Tens of thousands of love locks hang on the railway bridge leading to the cathedral.',
    'Couples have fastened padlocks to its fence since about 2008. Over 1,000 trains a day cross the bridge.')

city('Frankfurt am Main', 'DE', 15)
tip('sight', 'Römer', 'Römer (Frankfurt)', 50.1105, 8.6822,
    'The old town square with its half-timbered houses and the Römer, the city hall since 1405.',
    'Emperors were celebrated here after their coronation. Most of the houses were rebuilt after the Second World War.')
tip('person', 'Goethe House', 'Goethe House', 50.1110, 8.6778,
    'Johann Wolfgang von Goethe was born in this house in 1749 and wrote his first works here.',
    'The house was destroyed in 1944 and rebuilt; much of the original furniture had been saved and is back in its place.',
    person='Johann Wolfgang von Goethe')
tip('surprise', 'Main Tower', 'Main Tower', 50.1125, 8.6720,
    'Frankfurt’s only skyscraper with a viewing platform open to the public, about 200 metres up.',
    'From the top you look out over the towers of the banks, the river Main and the Taunus hills.')

city('Leipzig', 'DE', 15)
tip('sight', 'St. Nicholas Church', 'St. Nicholas Church, Leipzig', 51.3404, 12.3781,
    'The Monday prayers for peace in this church grew into the demonstrations of autumn 1989.',
    'On 9 October 1989, some 70,000 people marched peacefully around the city ring, a turning point on the way to the fall of the Wall.')
tip('person', 'St. Thomas Church', 'St. Thomas Church, Leipzig', 51.3393, 12.3726,
    'Johann Sebastian Bach was cantor here for 27 years and is buried in front of the altar.',
    'The St. Thomas Boys Choir, which Bach led, still sings here every week.',
    person='Johann Sebastian Bach')
tip('surprise', 'Monument to the Battle of the Nations', 'Monument to the Battle of the Nations', 51.3124, 12.4133,
    'A 91-metre stone monument to the battle of 1813 against Napoleon, finished in 1913.',
    'Inside, giant stone figures guard a crypt, and the platform at the top looks out over the whole city.')

city('Dresden', 'DE', 15)
tip('sight', 'Frauenkirche', 'Dresden Frauenkirche', 51.0519, 13.7416,
    'Destroyed in 1945, its ruins were a memorial for decades; it was rebuilt from 1994 and consecrated again in 2005.',
    'Many of the old stones were put back in their original places; they show up darker in the new walls.')
tip('surprise', 'Blue Wonder', 'Loschwitz Bridge', 51.0526, 13.8095,
    'A blue steel bridge across the Elbe from 1893 that the people of Dresden call the Blue Wonder.',
    'Next to it, one of the oldest suspension railways in the world climbs the hillside.')

city('Bonn', 'DE')
tip('person', 'Beethoven House', 'Beethoven House', 50.7372, 7.1015,
    'Ludwig van Beethoven was born in this house in 1770.',
    'It holds the largest Beethoven collection in the world, among it his last grand piano and his ear trumpets.',
    person='Ludwig van Beethoven')

# ---------- Europe ----------
city('Paris', 'FR', 25)
tip('sight', 'Musée d’Orsay', 'Musée d\'Orsay', 48.8600, 2.3266,
    'A grand railway station from 1900 that now holds the world’s best-known collection of Impressionist paintings.',
    'Look for the huge station clocks; through the glass of one of them you see across the Seine to the Louvre and Montmartre.')
tip('person', 'Shakespeare and Company', 'Shakespeare and Company (bookstore)', 48.8526, 2.3471,
    'An English-language bookshop by the Seine where young writers may sleep among the shelves.',
    'George Whitman opened it in 1951 and named it after Sylvia Beach’s shop of the 1920s, which first published James Joyce’s Ulysses.',
    person='Sylvia Beach & George Whitman')
tip('surprise', 'Catacombs of Paris', 'Catacombs of Paris', 48.8338, 2.3324,
    'Below the streets lie the bones of some six million Parisians, moved here from overflowing cemeteries from the 1780s on.',
    'A walk of about 1.5 km leads through old quarry tunnels lined with stacked bones.')

city('London', 'GB', 25)
tip('sight', 'Borough Market', 'Borough Market', 51.5055, -0.0910,
    'One of London’s oldest food markets, trading by London Bridge for many centuries.',
    'Under its Victorian iron roofs you find cheese, bread, game and street food from all over the world.')
tip('person', 'Charles Dickens Museum', 'Charles Dickens Museum', 51.5235, -0.1162,
    'Charles Dickens lived in this terraced house when he wrote Oliver Twist.',
    'He moved in with his young family in 1837. Rooms are furnished as in his day, with his writing desk.',
    person='Charles Dickens', avoid=['Dickens_dream.jpg'])
tip('surprise', 'Royal Observatory, Greenwich', 'Royal Observatory, Greenwich', 51.4769, -0.0005,
    'Stand with one foot in each hemisphere on the prime meridian, longitude 0°.',
    'All time zones of the world were once counted from here, Greenwich Mean Time. The red time ball on the roof still drops at 1 pm.')

city('Rome', 'IT', 25)
tip('sight', 'Pantheon', 'Pantheon, Rome', 41.8986, 12.4769,
    'A temple almost 1,900 years old whose dome is still the largest unreinforced concrete dome in the world.',
    'Light and rain fall through the open eye at the top, the oculus; small holes in the floor drain the water.')
tip('person', 'Keats-Shelley House', 'Keats-Shelley Memorial House', 41.9059, 12.4828,
    'The English poet John Keats died in a room of this house at the Spanish Steps in 1821, aged 25.',
    'Today it is a museum of the English Romantic poets who loved Rome, among them Keats, Shelley and Byron.',
    person='John Keats')
tip('surprise', 'Mouth of Truth', 'Mouth of Truth', 41.8881, 12.4814,
    'A marble face said to bite off the hand of anyone who tells a lie.',
    'The ancient disc, probably once a drain cover, hangs in the porch of the church of Santa Maria in Cosmedin.')

city('Barcelona', 'ES', 20)
tip('sight', 'La Boqueria', 'La Boqueria', 41.3817, 2.1716,
    'A covered market off La Rambla, with stalls of fruit, ham and seafood.',
    'Small bars inside the market cook what is sold around them.')
tip('person', 'Sagrada Família', 'Sagrada Família', 41.4036, 2.1744,
    'Antoni Gaudí worked on this basilica for over 40 years and is buried in its crypt; building goes on to this day.',
    'Gaudí designed its columns like trees, so the light inside falls as in a forest.',
    person='Antoni Gaudí')
tip('surprise', 'Montserrat', 'Montserrat (mountain)', 41.5933, 1.8378,
    'A saw-toothed mountain with a monastery on its side, about an hour from the city.',
    'A rack railway and a cable car climb to the monastery, home of the Black Madonna and one of Europe’s oldest boys’ choirs.')

city('Lisbon', 'PT', 15)
tip('sight', 'Belém Tower', 'Belém Tower', 38.6916, -9.2160,
    'A 16th-century fortress on the Tagus that guarded the way in and out of the harbour in the Age of Discovery.',
    'Its stonework shows ropes, armillary spheres and a carved rhinoceros.')
tip('person', 'A Brasileira', 'A Brasileira', 38.7107, -9.1424,
    'The poet Fernando Pessoa was a regular at this café, opened in 1905; his bronze figure sits at a table outside.',
    'Order a bica, the small Lisbon espresso, and take the seat next to him.',
    person='Fernando Pessoa')
tip('surprise', 'Pena Palace', 'Pena Palace', 38.7876, -9.3906,
    'A brightly painted 19th-century palace on a hilltop in the forests of Sintra.',
    'On clear days you can see from its terraces to Lisbon and the Atlantic.')

city('Amsterdam', 'NL', 15)
tip('sight', 'Rijksmuseum', 'Rijksmuseum', 52.3600, 4.8852,
    'The national museum of the Netherlands, home of Rembrandt’s Night Watch; a cycle path runs right through the building.',
    'Over 8,000 objects tell 800 years of Dutch art and history.')
tip('person', 'Anne Frank House', 'Anne Frank House', 52.3752, 4.8840,
    'Anne Frank hid with her family in the secret annex of this canal house for two years and wrote her diary here.',
    'The bookcase that hid the entrance is still in place.',
    person='Anne Frank')
tip('surprise', 'Zaanse Schans', 'Zaanse Schans', 52.4741, 4.8170,
    'Working windmills and green wooden houses by the river Zaan, about 15 km from the centre.',
    'Some of the mills still grind spices and press oil as they did 300 years ago.')

city('Vienna', 'AT', 20)
tip('sight', 'Naschmarkt', 'Naschmarkt', 48.1986, 16.3632,
    'Vienna’s best-known market, about 1.5 km of stalls along the Wienzeile.',
    'On Saturdays a flea market joins it at the far end.')
tip('person', 'Mozarthaus', 'Mozarthaus Vienna', 48.2075, 16.3755,
    'Wolfgang Amadeus Mozart lived in this apartment from 1784 to 1787 and wrote The Marriage of Figaro here.',
    'It is the only one of his Vienna homes that still stands.',
    person='Wolfgang Amadeus Mozart')
tip('surprise', 'Wiener Riesenrad', 'Wiener Riesenrad', 48.2166, 16.3958,
    'One of the oldest Ferris wheels still turning, built in 1897 in the Prater.',
    'Its red cabins rise to almost 65 metres above the amusement park.')

city('Prague', 'CZ', 15)
tip('sight', 'Charles Bridge', 'Charles Bridge', 50.0865, 14.4114,
    'A stone bridge from the 14th century lined with 30 statues of saints.',
    'Early in the morning, before the crowds arrive, it belongs to the photographers.')
tip('person', 'Golden Lane', 'Golden Lane', 50.0920, 14.4036,
    'Franz Kafka wrote in the little blue house at number 22 of this lane of tiny castle houses.',
    'He used it as a quiet place to write in 1916 and 1917, staying into the night.',
    person='Franz Kafka')
tip('surprise', 'Sedlec Ossuary', 'Sedlec Ossuary', 49.9620, 15.2882,
    'A chapel decorated with the bones of tens of thousands of people, in the town of Kutná Hora.',
    'Even the chandelier is made of bones. Kutná Hora is about an hour from Prague by train.')

# ---------- Rest of the world ----------
city('Istanbul', 'TR', 30)
tip('sight', 'Hagia Sophia', 'Hagia Sophia', 41.0086, 28.9802,
    'Built as a church in 537, it became a mosque in 1453; its dome has shaped the city for almost 1,500 years.',
    'Christian mosaics and Islamic calligraphy are seen side by side inside.')
tip('person', 'Museum of Innocence', 'Museum of Innocence', 41.0315, 28.9783,
    'Nobel laureate Orhan Pamuk wrote a novel and built this museum of everyday objects to go with it.',
    'Each display case belongs to a chapter of the book, and a ticket is printed inside the novel.',
    person='Orhan Pamuk')
tip('surprise', 'Basilica Cistern', 'Basilica Cistern', 41.0084, 28.9779,
    'An underground water tank from the 6th century, held up by 336 columns; two of them rest on Medusa heads.',
    'It once stored water for the Great Palace of the Byzantine emperors.')

city('New York City', 'US', 25)
tip('sight', 'High Line', 'High Line', 40.7480, -74.0048,
    'An old elevated freight railway on Manhattan’s West Side turned into a park in the air.',
    'The walk runs about 2.3 km above the streets, with plants that grew wild on the tracks.')
tip('person', 'Louis Armstrong House', 'Louis Armstrong House', 40.7546, -73.8616,
    'Louis Armstrong lived in this modest house in Queens from 1943 until his death in 1971.',
    'He could have lived anywhere, but chose to stay among his neighbours; his home recordings are played in the rooms.',
    person='Louis Armstrong')
tip('surprise', 'Grand Central Terminal', 'Grand Central Terminal', 40.7527, -73.9772,
    'Whisper into a corner of the tiled arches outside the Oyster Bar, and someone in the far corner hears you.',
    'Look up in the main hall: the ceiling shows the constellations, painted in reverse.')

city('San Francisco', 'US', 15)
tip('sight', 'Alcatraz Island', 'Alcatraz Island', 37.8267, -122.4230,
    'The island prison in the bay, closed in 1963, once held Al Capone.',
    'Ferries leave from Pier 33; the audio tour is told by former guards and inmates.')
tip('person', 'City Lights Bookstore', 'City Lights Bookstore', 37.7976, -122.4066,
    'Poet Lawrence Ferlinghetti’s bookshop published Allen Ginsberg’s Howl in 1956 and became the home of the Beat writers.',
    'The poetry room upstairs invites you to sit down and read.',
    person='Lawrence Ferlinghetti')
tip('surprise', 'Cable cars', 'San Francisco cable car system', 37.7848, -122.4076,
    'The last cable cars in the world still worked by hand, running since 1873.',
    'At the end of the line on Powell Street the cars are turned around on a turntable, pushed by the crew.')

city('Mexico City', 'MX', 30)
tip('sight', 'Palacio de Bellas Artes', 'Palacio de Bellas Artes', 19.4352, -99.1412,
    'A white marble palace of the arts, with murals by Diego Rivera inside.',
    'Its stage curtain is made of nearly a million pieces of coloured glass by Tiffany.')
tip('person', 'Frida Kahlo Museum', 'Frida Kahlo Museum', 19.3551, -99.1625,
    'Frida Kahlo was born, lived and died in this blue house in Coyoacán.',
    'Her studio, her easel and her clothes are still in the house, which she shared with Diego Rivera.',
    person='Frida Kahlo')
tip('surprise', 'Xochimilco', 'Xochimilco', 19.2574, -99.1052,
    'Colourful boats glide along canals that are a remnant of the old Aztec lake landscape.',
    'Mariachi bands and food sellers pull up alongside in their own boats.')

city('Rio de Janeiro', 'BR', 25)
tip('sight', 'Christ the Redeemer', 'Christ the Redeemer (statue)', -22.9519, -43.2105,
    'The 30-metre statue on Corcovado mountain, 700 metres above the city.',
    'A rack railway through the Tijuca forest climbs to its feet.')
tip('person', 'Selarón Steps', 'Escadaria Selarón', -22.9153, -43.1792,
    'Chilean artist Jorge Selarón covered these 215 steps with tiles from all over the world.',
    'He worked on them for more than 20 years; visitors sent him tiles from their home countries.',
    person='Jorge Selarón')
tip('surprise', 'Sugarloaf Mountain', 'Sugarloaf Mountain', -22.9486, -43.1566,
    'Two cable cars climb via Urca hill to the top of the granite peak at the mouth of the bay.',
    'Come for the sunset over the city and Copacabana.')

city('Buenos Aires', 'AR', 25)
tip('sight', 'Caminito', 'Caminito', -34.6393, -58.3627,
    'A colourful street in La Boca, painted like the houses of the dock workers who settled here.',
    'Tango dancers perform on the pavement for passers-by.')
tip('person', 'Café Tortoni', 'Café Tortoni', -34.6088, -58.3787,
    'The city’s oldest café, opened in 1858, where Jorge Luis Borges and Carlos Gardel were guests.',
    'Tango shows still take place in its cellar.',
    person='Jorge Luis Borges')
tip('surprise', 'Recoleta Cemetery', 'La Recoleta Cemetery', -34.5875, -58.3934,
    'A city of marble mausoleums where Eva Perón is buried.',
    'Its avenues and statues make it one of the most visited cemeteries in the world.')

city('Cairo', 'EG', 30)
tip('sight', 'Khan el-Khalili', 'Khan el-Khalili', 30.0477, 31.2622,
    'A bazaar of narrow lanes founded in the 14th century in the heart of old Cairo.',
    'Stop at one of the old coffee houses for mint tea.')
tip('surprise', 'Pyramids of Giza', 'Giza pyramid complex', 29.9792, 31.1342,
    'The last of the Seven Wonders of the Ancient World still standing, right at the edge of the city.',
    'The Great Pyramid was the tallest structure built by people for more than 3,800 years.')

city('Cape Town', 'ZA', 25)
tip('sight', 'Table Mountain', 'Table Mountain', -33.9628, 18.4098,
    'The flat-topped mountain above the city, reached by a cable car whose floor turns as it climbs.',
    'When clouds pour over its edge, people here say the table cloth is laid.')
tip('person', 'Robben Island', 'Robben Island', -33.8067, 18.3664,
    'Nelson Mandela spent 18 of his 27 years in prison on this island.',
    'Tours are led by former political prisoners and stop at his cell.',
    person='Nelson Mandela')
tip('surprise', 'Boulders Beach', 'Boulders Beach', -34.1972, 18.4517,
    'African penguins nest on this beach between granite boulders.',
    'Wooden walkways lead you right past the colony.')

city('Nairobi', 'KE', 25)
tip('sight', 'Nairobi National Museum', 'Nairobi National Museum', -1.2740, 36.8146,
    'Kenya’s national museum, with collections on the country’s history, nature, culture and art.',
    'A snake park is part of the museum grounds.')
tip('surprise', 'Nairobi National Park', 'Nairobi National Park', -1.3733, 36.8589,
    'Lions, rhinos and giraffes live in a national park with the city skyline in the background.',
    'It lies only about 7 km from the centre of the capital.')

city('Tokyo', 'JP', 30)
tip('sight', 'Sensō-ji', 'Sensō-ji', 35.7148, 139.7967,
    'Tokyo’s oldest temple, reached through the Thunder Gate with its giant red lantern.',
    'The shopping street in front of it has sold snacks and souvenirs to pilgrims for centuries.')
tip('person', 'Ghibli Museum', 'Ghibli Museum', 35.6962, 139.5704,
    'Hayao Miyazaki designed this museum of the Studio Ghibli films himself; a robot soldier guards its roof garden.',
    'Tickets name a date and time and are sold in advance only.',
    person='Hayao Miyazaki')
tip('surprise', 'Shibuya Crossing', 'Shibuya Crossing', 35.6595, 139.7005,
    'When the lights turn green, crowds cross this junction from all sides at once.',
    'The statue of the faithful dog Hachikō waits by the station exit.')

city('Kyoto', 'JP', 15)
tip('sight', 'Kinkaku-ji', 'Kinkaku-ji', 35.0394, 135.7292,
    'A Zen temple whose top two floors are covered in gold leaf.',
    'It is mirrored in the pond in front of it.')
tip('surprise', 'Fushimi Inari-taisha', 'Fushimi Inari-taisha', 34.9671, 135.7727,
    'Thousands of vermilion torii gates form tunnels up a wooded mountain.',
    'Each gate was given by a person or a company; the walk to the top takes about two hours.')

city('Seoul', 'KR', 25)
tip('sight', 'Gyeongbokgung', 'Gyeongbokgung', 37.5796, 126.9770,
    'The main royal palace of the Joseon dynasty, first built in 1395.',
    'The changing of the guard takes place at its main gate.',
    avoid=['조선물산공진회_광고지-1_(부분)_(cropped).jpg'])
tip('sight', 'Gwangjang Market', 'Gwangjang Market', 37.5700, 126.9996,
    'One of Korea’s oldest markets, famous for its mung bean pancakes.',
    'Hundreds of food stalls fill the covered lanes.')
tip('surprise', 'Cheonggyecheon', 'Cheonggyecheon', 37.5690, 126.9785,
    'A stream once buried under an elevated highway flows through the city centre again.',
    'The highway was torn down and the stream opened up in 2005; it is now an almost 11 km walk.')

city('Beijing', 'CN', 30)
tip('sight', 'Forbidden City', 'Forbidden City', 39.9163, 116.3972,
    'The palace of 24 emperors of the Ming and Qing dynasties.',
    'For almost 500 years no one could enter without the emperor’s permission.')
tip('sight', 'Temple of Heaven', 'Temple of Heaven', 39.8822, 116.4066,
    'Emperors prayed here for good harvests, in a round hall of wood under a blue roof.',
    'Today the park is full of people doing tai chi, dancing and playing cards in the mornings.')
tip('surprise', 'Mutianyu', 'Mutianyu', 40.4319, 116.5704,
    'A restored stretch of the Great Wall about 70 km from the city.',
    'A chairlift goes up and a toboggan run brings you back down.')

city('Singapore', 'SG', 25)
tip('sight', 'Gardens by the Bay', 'Gardens by the Bay', 1.2816, 103.8636,
    'Steel Supertrees up to 50 metres tall, planted with ferns and orchids.',
    'Every evening they light up to music.')
tip('sight', 'Lau Pa Sat', 'Lau Pa Sat', 1.2806, 103.8504,
    'A Victorian cast-iron market hall that is now a busy food centre.',
    'At night the street beside it fills with satay stalls.')
tip('surprise', 'Pulau Ubin', 'Pulau Ubin', 1.4044, 103.9625,
    'An island of village houses and mangroves, a short boat ride from the mainland.',
    'Rent a bicycle and explore one of the last kampongs, traditional villages, of Singapore.')

city('Mumbai', 'IN', 25)
tip('sight', 'Chhatrapati Shivaji Terminus', 'Chhatrapati Shivaji Maharaj Terminus', 18.9398, 72.8355,
    'A Victorian Gothic railway station, still one of the busiest in India.',
    'It was finished in 1888 and is a World Heritage Site.')
tip('person', 'Mani Bhavan', 'Mani Bhavan', 18.9596, 72.8114,
    'Mahatma Gandhi stayed in this house whenever he was in Bombay from 1917 to 1934.',
    'His room, with his spinning wheel, is kept as it was.',
    person='Mahatma Gandhi')
tip('surprise', 'Elephanta Caves', 'Elephanta Caves', 18.9633, 72.9315,
    'Rock-cut temples with a huge three-headed Shiva, on an island in the harbour.',
    'Ferries leave from the Gateway of India.')

city('Sydney', 'AU', 25)
tip('person', 'Sydney Opera House', 'Sydney Opera House', -33.8568, 151.2153,
    'Danish architect Jørn Utzon won the design competition in 1957, but left in 1966 and never saw the finished building.',
    'The roof shells are covered with more than a million tiles.',
    person='Jørn Utzon')
tip('sight', 'Sydney Harbour Bridge', 'Sydney Harbour Bridge', -33.8523, 151.2108,
    'You can climb the arch of the bridge, 134 metres above the harbour.',
    'Locals call it the Coathanger.')
tip('surprise', 'Bondi Beach', 'Bondi Beach', -33.8915, 151.2767,
    'Australia’s best-known beach, with an ocean pool cut into the rocks at its southern end.',
    'A coastal path leads along the cliffs to Coogee.')

city('Athens', 'GR', 20)
tip('sight', 'Acropolis', 'Acropolis of Athens', 37.9715, 23.7257,
    'The Parthenon has stood on this rock above the city for almost 2,500 years.',
    'The Acropolis Museum at its foot shows the sculptures that once decorated the temples.')
tip('person', 'Ancient Agora', 'Ancient Agora of Athens', 37.9747, 23.7223,
    'Socrates questioned the citizens of Athens in this marketplace.',
    'The Temple of Hephaestus above the agora is one of the best preserved Greek temples.',
    person='Socrates')
tip('surprise', 'Cape Sounion', 'Cape Sounion', 37.6503, 24.0246,
    'The ruins of a temple of Poseidon on a cape above the Aegean, about 70 km from Athens.',
    'Lord Byron carved his name into one of its columns.')

city('Stockholm', 'SE', 20)
tip('sight', 'Vasa Museum', 'Vasa Museum', 59.3280, 18.0914,
    'A warship that sank on its maiden voyage in 1628 and was raised almost intact in 1961.',
    'It is the best preserved ship of its time anywhere.')
tip('person', 'ABBA The Museum', 'ABBA The Museum', 59.3251, 18.0963,
    'The story of the band that won the Eurovision Song Contest in 1974 with Waterloo.',
    'Costumes, gold records and a copy of the studio where many of the songs were recorded.',
    person='ABBA')
tip('surprise', 'Metro art', 'Stockholm metro', 59.3313, 18.0596,
    'Over 90 of the 100 metro stations are decorated with art; some look like painted caves.',
    'Start at T-Centralen, with its blue vines on the rock walls.')

# ---- Russia ----
city('Moscow', 'RU', 30)
tip('sight', 'Saint Basil’s Cathedral', "Saint Basil's Cathedral", 55.7525, 37.6231,
    'The church with the colourful onion domes at the end of Red Square, built in the 1550s for Ivan the Terrible.',
    'Inside it is not one big hall but a maze of small chapels, each under its own dome.')
tip('person', 'Tretyakov Gallery', 'Tretyakov Gallery', 55.7414, 37.6208,
    'The merchant Pavel Tretyakov collected Russian paintings all his life and gave them to the city in 1892.',
    'His collection is still the heart of the largest museum of Russian art.',
    person='Pavel Tretyakov')
tip('surprise', 'Komsomolskaya metro station', 'Komsomolskaya (Koltsevaya line)', 55.7757, 37.6545,
    'A metro station like a palace hall, with chandeliers and mosaics on a yellow vaulted ceiling.',
    'It lies under three railway stations, so millions pass through without looking up.')

city('Saint Petersburg', 'RU', 30)
tip('sight', 'Hermitage Museum', 'Hermitage Museum', 59.9398, 30.3146,
    'One of the largest art museums in the world, partly housed in the tsars’ green and white Winter Palace.',
    'Cats have lived in its cellars for centuries to keep the mice away.')
tip('person', 'Peter and Paul Fortress', 'Peter and Paul Fortress', 59.9500, 30.3166,
    'Peter the Great founded the city here in 1703, with a fortress on a small island in the Neva.',
    'He and most of the later tsars are buried in its cathedral with the golden spire.',
    person='Peter the Great')
tip('surprise', 'Peterhof', 'Peterhof Palace', 59.8853, 29.9086,
    'A palace on the Gulf of Finland with more than a hundred fountains that run without a single pump.',
    'The water comes downhill from springs, carried by channels laid out in the 18th century.')

city('Kazan', 'RU', 20)
tip('sight', 'Kazan Kremlin', 'Kazan Kremlin', 55.7990, 49.1060,
    'A white fortress above the Volga where a mosque and an Orthodox cathedral stand side by side.',
    'The blue-domed Qolşärif Mosque was rebuilt inside its walls and opened in 2005.')

city('Novosibirsk', 'RU', 30)
tip('sight', 'Novosibirsk Opera and Ballet Theatre', 'Novosibirsk Opera and Ballet Theatre', 55.0306, 82.9244,
    'The largest theatre building in Russia, under a huge silver dome in the middle of Siberia.',
    'It was finished in 1945, and the city likes to call it the Siberian Colosseum.')
tip('surprise', 'Akademgorodok', 'Akademgorodok', 54.8443, 83.1030,
    'A town of science institutes in the birch forest, built in the 1950s for thousands of researchers.',
    'Its beach on the Ob Reservoir is known locally as the Ob Sea.')

city('Irkutsk', 'RU', 80)
tip('surprise', 'Listvyanka on Lake Baikal', 'Listvyanka', 51.8536, 104.8697,
    'A village on the shore of Lake Baikal, the deepest and oldest lake on Earth.',
    'In winter the ice gets thick enough for cars and you can look through it into the clear water.')
tip('sight', 'Circum-Baikal Railway', 'Circum-Baikal Railway', 51.8700, 104.8200,
    'An old railway line along the cliffs of Lake Baikal, with dozens of tunnels, bridges and galleries.',
    'Once part of the Trans-Siberian, it now carries slow excursion trains.')

city('Vladivostok', 'RU', 25)
tip('sight', 'Vladivostok railway station', 'Vladivostok railway station', 43.1112, 131.8818,
    'The end of the Trans-Siberian Railway, 9,288 km from Moscow.',
    'A stone marker on the platform shows the distance.')
tip('surprise', 'Russky Bridge', 'Russky Bridge', 43.0806, 131.9370,
    'When it opened in 2012, this bridge to Russky Island had the longest cable-stayed span in the world.',
    'Its two towers are taller than 320 metres.')

# ---- China ----
city('Shanghai', 'CN', 30)
tip('sight', 'The Bund', 'The Bund', 31.2400, 121.4900,
    'A riverside promenade lined with banks and trading houses from the early 20th century.',
    'Across the Huangpu River the skyscrapers of Pudong light up at night.')
tip('sight', 'Yu Garden', 'Yu Garden', 31.2272, 121.4921,
    'A classical Chinese garden from the 16th century, with rock piles, ponds and pavilions.',
    'The tea house on a zigzag bridge nearby is one of the oldest in the city.')
tip('surprise', 'Shanghai Maglev', 'Shanghai maglev train', 31.2035, 121.5865,
    'A magnetic levitation train that floats to the airport at up to 300 km/h.',
    'The 30 km ride takes about eight minutes.')

city('Xi’an', 'CN', 50)
tip('surprise', 'Terracotta Army', 'Terracotta Army', 34.3841, 109.2785,
    'Thousands of life-size clay soldiers, buried with China’s first emperor more than 2,200 years ago.',
    'Farmers digging a well found the first pieces in 1974.')
tip('person', 'Giant Wild Goose Pagoda', 'Giant Wild Goose Pagoda', 34.2196, 108.9594,
    'Built in 652 to keep the Buddhist scriptures the monk Xuanzang brought back from India.',
    'His long journey later inspired the novel Journey to the West.',
    person='Xuanzang')
tip('sight', 'City Wall of Xi’an', 'Fortifications of Xi\'an', 34.2610, 108.9470,
    'One of the best preserved city walls in China, about 14 km around.',
    'You can rent a bicycle and ride all the way round on top of it.')

city('Chengdu', 'CN', 60)
tip('sight', 'Giant Panda Base', 'Chengdu Research Base of Giant Panda Breeding', 30.7330, 104.1460,
    'A breeding centre where you can watch giant pandas eat bamboo, best in the early morning.',
    'Many of the pandas born here have gone to zoos around the world.')
tip('person', 'Du Fu Thatched Cottage', 'Du Fu Thatched Cottage', 30.6600, 104.0300,
    'The poet Du Fu lived here in a simple hut around 760 and wrote hundreds of poems.',
    'Today a park with bamboo groves and halls stands on the spot.',
    person='Du Fu')
tip('surprise', 'Dujiangyan', 'Dujiangyan', 31.0020, 103.6070,
    'An irrigation system built in the 3rd century BC that still waters the Chengdu plain today.',
    'It splits the Min River without a dam.')

city('Guilin', 'CN', 25)
tip('sight', 'Elephant Trunk Hill', 'Elephant Trunk Hill', 25.2690, 110.2970,
    'A limestone hill on the Li River that looks like an elephant drinking from the water.',
    'It has become the symbol of the city.')
tip('surprise', 'Reed Flute Cave', 'Reed Flute Cave', 25.3100, 110.2650,
    'A cave full of stalactites and stone curtains, lit in bright colours.',
    'It is named after the reeds outside, which were used to make flutes.')

city('Hong Kong', 'HK', 30)
tip('sight', 'Victoria Peak', 'Victoria Peak', 22.2759, 114.1455,
    'The highest hill on Hong Kong Island, with a view over the skyscrapers and the harbour.',
    'The Peak Tram has climbed the steep slope since 1888.')
tip('sight', 'Star Ferry', 'Star Ferry', 22.2937, 114.1688,
    'Green and white ferries have crossed Victoria Harbour between Kowloon and the island for over a century.',
    'The crossing takes only a few minutes and costs very little.')
tip('surprise', 'Tian Tan Buddha', 'Tian Tan Buddha', 22.2540, 113.9050,
    'A giant bronze Buddha on a hilltop on Lantau Island, reached by 268 steps.',
    'A long cable car ride leads up from the town below.')

city('Harbin', 'CN', 25)
tip('sight', 'Saint Sophia Cathedral', 'Saint Sophia Cathedral, Harbin', 45.7690, 126.6240,
    'A Russian Orthodox church with a green dome, a reminder of the Russians who built the railway here.',
    'Today it is a museum of the city’s history.')
tip('surprise', 'Harbin Ice and Snow World', 'Harbin Ice and Snow World', 45.7800, 126.5700,
    'Each winter whole buildings are carved from blocks of river ice and lit from within.',
    'It is part of the Harbin Ice Festival, one of the largest in the world.')

city('Lhasa', 'CN', 20)
tip('sight', 'Potala Palace', 'Potala Palace', 29.6578, 91.1169,
    'The former winter palace of the Dalai Lamas, rising thirteen storeys up the Red Hill.',
    'It stands at about 3,700 metres above sea level.')
tip('sight', 'Jokhang', 'Jokhang', 29.6528, 91.1325,
    'The most sacred temple in Tibetan Buddhism, circled clockwise by pilgrims all day long.',
    'Many pilgrims prostrate themselves full length on the stones in front of it.')

# ---- Japan ----
city('Osaka', 'JP', 15)
tip('sight', 'Osaka Castle', 'Osaka Castle', 34.6873, 135.5262,
    'A castle with a white and gold keep above high stone walls and wide moats.',
    'Around it lies a park with hundreds of cherry trees.')
tip('sight', 'Dōtonbori', 'Dōtonbori', 34.6687, 135.5013,
    'A canal street of neon signs and street food; Osaka calls itself the nation’s kitchen.',
    'Try takoyaki, small balls of batter with octopus inside.')
tip('surprise', 'Shinsekai', 'Shinsekai', 34.6525, 135.5063,
    'An old entertainment quarter around the Tsūtenkaku tower, with a lively retro feel.',
    'It is known for kushikatsu, skewers fried in breadcrumbs.')

city('Nara-shi', 'JP', 12)
tip('sight', 'Tōdai-ji', 'Tōdai-ji', 34.6890, 135.8398,
    'A huge wooden temple hall that houses a bronze Buddha about 15 metres tall.',
    'The hall was rebuilt in 1709 and is still among the largest wooden buildings in the world.')
tip('surprise', 'Nara Park', 'Nara Park', 34.6851, 135.8430,
    'Over a thousand tame deer roam the park freely and bow to visitors for crackers.',
    'In local tradition the deer are messengers of the gods.')

city('Hiroshima', 'JP', 30)
tip('sight', 'Atomic Bomb Dome', 'Hiroshima Peace Memorial', 34.3955, 132.4536,
    'The ruin of a hall that stood almost directly below the atomic bomb explosion of 6 August 1945.',
    'It was left as it was, as a memorial for peace.')
tip('person', 'Children’s Peace Monument', 'Children\'s Peace Monument', 34.3934, 132.4524,
    'A memorial to Sadako Sasaki, who folded paper cranes hoping to recover from leukaemia caused by the bomb.',
    'Children from all over the world still send strings of paper cranes here.',
    person='Sadako Sasaki')
tip('surprise', 'Itsukushima Shrine', 'Itsukushima Shrine', 34.2959, 132.3199,
    'A shrine whose red gate seems to float on the sea at high tide.',
    'At low tide you can walk across the sand to the gate.')

city('Sapporo', 'JP', 20)
tip('sight', 'Odori Park', 'Odori Park', 43.0597, 141.3478,
    'A long park through the city centre where the Sapporo Snow Festival shows giant snow sculptures each February.',
    'The TV tower at its eastern end gives a view along the whole park.')
tip('sight', 'Sapporo Clock Tower', 'Sapporo Clock Tower', 43.0625, 141.3536,
    'A wooden building from 1878 with a clock that has kept time for well over a century.',
    'It was built for an agricultural college founded with help from the United States.')

city('Naha', 'JP', 20)
tip('sight', 'Shuri Castle', 'Shuri Castle', 26.2170, 127.7195,
    'The red palace of the kings of Ryukyu, who ruled Okinawa as their own kingdom for centuries.',
    'A fire destroyed the main hall in 2019, and it is being rebuilt.')

# ---- South and Southeast Asia ----
city('Bangkok', 'TH', 30)
tip('sight', 'Wat Arun', 'Wat Arun', 13.7437, 100.4888,
    'The Temple of Dawn, its tall spire covered with pieces of porcelain, on the bank of the Chao Phraya.',
    'It looks best at sunset, seen from the other side of the river.')
tip('sight', 'Grand Palace', 'Grand Palace', 13.7500, 100.4913,
    'The royal palace with the Temple of the Emerald Buddha, the most sacred temple in Thailand.',
    'Visitors need to cover shoulders and knees.')
tip('surprise', 'Chatuchak Weekend Market', 'Chatuchak Weekend Market', 13.7999, 100.5500,
    'One of the largest markets in the world, with thousands of stalls open at weekends.',
    'Everything from plants to vintage clothes and street food.')

city('Hanoi', 'VN', 25)
tip('sight', 'Hoàn Kiếm Lake', 'Hoàn Kiếm Lake', 21.0288, 105.8525,
    'A lake in the old town with a red bridge to a small temple on an island.',
    'Legend says a turtle took back a magic sword from a king here.')
tip('sight', 'Temple of Literature', 'Temple of Literature, Hanoi', 21.0293, 105.8355,
    'Vietnam’s first university, founded in 1076 and dedicated to Confucius.',
    'Stone tablets on the backs of turtles list the names of its best graduates.')

city('Jakarta', 'ID', 25)
tip('sight', 'National Monument', 'National Monument (Indonesia)', -6.1754, 106.8272,
    'A tall obelisk with a flame covered in gold leaf, the symbol of Indonesia’s independence.',
    'A lift takes you up to a viewing platform.')
tip('sight', 'Kota Tua', 'Kota Tua Jakarta', -6.1352, 106.8133,
    'The old town of Batavia, the Dutch colonial port, around a square with the former city hall.',
    'Colourful bicycles can be rented on the square.')

city('Yogyakarta', 'ID', 50)
tip('surprise', 'Borobudur', 'Borobudur', -7.6079, 110.2038,
    'The largest Buddhist temple in the world, built in the 9th century as a stepped stone mountain.',
    'Over 2,600 relief panels tell stories as you climb.')
tip('sight', 'Prambanan', 'Prambanan', -7.7520, 110.4915,
    'A Hindu temple compound from the 9th century with tall, pointed stone towers.',
    'The Ramayana ballet is performed in front of it on many evenings.')

city('Kuala Lumpur', 'MY', 25)
tip('sight', 'Petronas Towers', 'Petronas Towers', 3.1579, 101.7116,
    'Twin skyscrapers joined by a skybridge, the tallest buildings in the world from 1998 to 2004.',
    'Their floor plan is based on an eight-pointed star from Islamic art.')
tip('surprise', 'Batu Caves', 'Batu Caves', 3.2379, 101.6840,
    'A Hindu temple inside a limestone cave, reached by 272 colourful steps.',
    'A golden statue more than 40 metres tall stands at the foot of the stairs.')

city('Delhi', 'IN', 30)
tip('sight', 'Qutb Minar', 'Qutb Minar', 28.5245, 77.1855,
    'A tower of red sandstone about 73 metres high, begun around 1200.',
    'Nearby stands an iron pillar that has hardly rusted in over 1,500 years.')
tip('sight', 'Humayun’s Tomb', "Humayun's Tomb", 28.5933, 77.2507,
    'A garden tomb of the Mughal emperor Humayun that set the pattern for the Taj Mahal.',
    'It is surrounded by a garden divided into four parts by water channels.')
tip('person', 'Raj Ghat', 'Raj Ghat', 28.6406, 77.2495,
    'A black marble platform marks the place where Mahatma Gandhi was cremated in 1948.',
    'An eternal flame burns at one end.',
    person='Mahatma Gandhi')

city('Agra', 'IN', 20)
tip('person', 'Taj Mahal', 'Taj Mahal', 27.1751, 78.0421,
    'The white marble tomb that Emperor Shah Jahan built for his wife Mumtaz Mahal.',
    'The marble changes colour from pink in the morning to gold at sunset.',
    person='Shah Jahan')
tip('sight', 'Agra Fort', 'Agra Fort', 27.1795, 78.0211,
    'A red sandstone fortress of the Mughal emperors on the Yamuna river.',
    'Shah Jahan spent his last years here, looking across at the Taj Mahal.')

city('Kathmandu', 'NP', 15)
tip('sight', 'Boudhanath', 'Boudhanath', 27.7215, 85.3620,
    'One of the largest stupas in the world, with the Buddha’s eyes painted on its tower.',
    'Pilgrims walk around it clockwise and turn the prayer wheels.')
tip('surprise', 'Swayambhunath', 'Swayambhunath', 27.7149, 85.2904,
    'An old stupa on a hill above the city, known as the Monkey Temple.',
    'Hundreds of monkeys live on the hill.')

city('Ulan Bator', 'MN', 60)
tip('sight', 'Gandan Monastery', 'Gandantegchinlen Monastery', 47.9214, 106.8945,
    'Mongolia’s largest Buddhist monastery, with a statue of a bodhisattva about 26 metres tall.',
    'Morning prayers with chanting monks are open to visitors.')
tip('surprise', 'Genghis Khan Equestrian Statue', 'Genghis Khan Equestrian Statue', 47.8081, 107.5296,
    'A steel statue of Genghis Khan on horseback, about 40 metres tall, in the open steppe.',
    'You can climb up to the horse’s head for the view.')

city('Samarkand', 'UZ', 15)
tip('sight', 'Registan', 'Registan', 39.6547, 66.9758,
    'A square framed by three madrasas covered in blue and turquoise tiles.',
    'It was the heart of the city on the Silk Road.')
tip('person', 'Gur-e-Amir', 'Gur-e-Amir', 39.6484, 66.9690,
    'The tomb of the conqueror Timur, under a ribbed turquoise dome.',
    'Its design influenced later Mughal tombs such as the Taj Mahal.',
    person='Timur')

city('Almaty', 'KZ', 25)
tip('surprise', 'Medeu', 'Medeu', 43.1575, 77.0590,
    'A huge outdoor ice rink high up in a mountain valley above the city.',
    'Many speed skating world records were set on its ice.')

# ---- Middle East and Africa ----
city('Tehran', 'IR', 25)
tip('sight', 'Golestan Palace', 'Golestan Palace', 35.6800, 51.4202,
    'The palace of the Qajar shahs, with halls of mirror mosaics and tiled courtyards.',
    'It is the oldest historic monument in Tehran.')
tip('sight', 'Azadi Tower', 'Azadi Tower', 35.6997, 51.3380,
    'A white marble gate tower built in 1971 at the western entrance to the city.',
    'Its shape mixes Persian architecture of many periods.')

city('Amman', 'JO', 20)
tip('sight', 'Amman Citadel', 'Amman Citadel', 31.9540, 35.9350,
    'A hill in the centre that has been settled for thousands of years, with a Roman temple and an Umayyad palace.',
    'From the top you see the Roman Theatre below.')
tip('sight', 'Roman Theatre', 'Roman Theatre (Amman)', 31.9515, 35.9393,
    'A Roman theatre cut into the hillside, with seats for about 6,000 people.',
    'It is still used for concerts.')

city('Marrakesh', 'MA', 20)
tip('sight', 'Jemaa el-Fnaa', 'Jemaa el-Fnaa', 31.6258, -7.9891,
    'The main square of the old town, full of storytellers, musicians and food stalls in the evening.',
    'UNESCO lists its oral traditions as world heritage.')
tip('person', 'Majorelle Garden', 'Majorelle Garden', 31.6417, -8.0033,
    'A garden painted in bright blue, laid out by the painter Jacques Majorelle and later saved by Yves Saint Laurent.',
    'The fashion designer’s ashes were scattered here.',
    person='Yves Saint Laurent')

city('Addis Ababa', 'ET', 20)
tip('sight', 'National Museum of Ethiopia', 'National Museum of Ethiopia', 9.0386, 38.7614,
    'Home of Lucy, a 3.2 million-year-old skeleton of an early human ancestor found in Ethiopia.',
    'The original is kept safe; the hall shows a cast.')
tip('person', 'Holy Trinity Cathedral', 'Holy Trinity Cathedral, Addis Ababa', 9.0300, 38.7660,
    'Emperor Haile Selassie and his wife are buried in this cathedral.',
    'Its stained glass windows show scenes from Ethiopian history.',
    person='Haile Selassie')

city('Lagos', 'NG', 30)
tip('surprise', 'Lekki Conservation Centre', 'Lekki Conservation Centre', 6.4419, 3.5354,
    'A nature reserve in the city with a long canopy walkway high above the treetops.',
    'Monkeys, crocodiles and many birds live in its wetland.')
tip('sight', 'Third Mainland Bridge', 'Third Mainland Bridge', 6.5000, 3.4000,
    'A bridge about 11.8 km long across the Lagos Lagoon, from the mainland to Lagos Island.',
    'Fishing villages on stilts can be seen from it.')

city('Accra', 'GH', 20)
tip('person', 'Kwame Nkrumah Memorial Park', 'Kwame Nkrumah Mausoleum', 5.5450, -0.2005,
    'Kwame Nkrumah led Ghana to independence in 1957, the first colony south of the Sahara to become free.',
    'He is buried here, on the spot where he declared independence.',
    person='Kwame Nkrumah')

city('Dakar', 'SN', 20)
tip('sight', 'African Renaissance Monument', 'African Renaissance Monument', 14.7222, -17.4950,
    'A bronze statue about 49 metres tall on a hill above the Atlantic.',
    'It was unveiled in 2010, 50 years after Senegal’s independence.')
tip('surprise', 'Gorée', 'Gorée', 14.6670, -17.3980,
    'A small island off Dakar, remembered as a place of the Atlantic slave trade.',
    'The House of Slaves with its Door of No Return is a memorial today.')

city('Zanzibar', 'TZ', 20)
tip('sight', 'Stone Town', 'Stone Town', -6.1622, 39.1921,
    'The old trading town of Zanzibar, a maze of lanes with carved wooden doors.',
    'Freddie Mercury was born here in 1946.')

# ---- The Americas and Oceania ----
city('Toronto', 'CA', 25)
tip('sight', 'CN Tower', 'CN Tower', 43.6426, -79.3871,
    'A tower 553 metres tall that was the world’s tallest free-standing structure for over 30 years.',
    'A glass floor lets you look straight down 342 metres.')

city('Montréal', 'CA', 20)
tip('sight', 'Notre-Dame Basilica', 'Notre-Dame Basilica (Montreal)', 45.5045, -73.5562,
    'A church with a deep blue vault full of golden stars.',
    'Céline Dion was married here in 1994.')

city('Vancouver', 'CA', 20)
tip('sight', 'Stanley Park', 'Stanley Park', 49.3043, -123.1443,
    'A forest park larger than New York’s Central Park, almost surrounded by the sea.',
    'A seawall path runs about 9 km around it.')
tip('surprise', 'Capilano Suspension Bridge', 'Capilano Suspension Bridge', 49.3429, -123.1149,
    'A swaying footbridge 140 metres long, high above a river canyon in the rainforest.',
    'The first bridge across the canyon here was built of hemp rope in 1889.')

city('Havana', 'CU', 20)
tip('sight', 'Malecón', 'Malecón, Havana', 23.1441, -82.3720,
    'A seafront promenade 8 km long where people meet in the evening; waves often spray over the wall.',
    'Old American cars cruise past the faded colourful facades.')
tip('person', 'El Floridita', 'El Floridita', 23.1374, -82.3577,
    'A bar where Ernest Hemingway drank his daiquiris; a bronze statue of him leans on the counter.',
    'It calls itself the cradle of the daiquiri.',
    person='Ernest Hemingway')

city('Bogotá', 'CO', 50)
tip('sight', 'Gold Museum', 'Gold Museum, Bogotá', 4.6018, -74.0720,
    'One of the largest collections of pre-Hispanic gold work in the world.',
    'Its most famous piece is a golden raft linked to the legend of El Dorado.')
tip('sight', 'Monserrate', 'Monserrate', 4.6058, -74.0560,
    'A mountain above the city at over 3,100 metres, with a church on its summit.',
    'A funicular and a cable car lead to the top.')
tip('surprise', 'Salt Cathedral of Zipaquirá', 'Salt Cathedral of Zipaquirá', 5.0193, -74.0098,
    'A church carved out of a salt mine, about 180 metres underground.',
    'Its tunnels and halls are lit in changing colours.')

city('Lima', 'PE', 25)
tip('sight', 'Huaca Pucllana', 'Huaca Pucllana', -12.1107, -77.0336,
    'A large adobe pyramid from about 500 AD in the middle of the Miraflores district.',
    'It was built from millions of mud bricks set upright like books on a shelf.')
tip('sight', 'Larco Museum', 'Larco Museum', -12.0722, -77.0706,
    'A museum of ancient Peruvian art in an 18th-century mansion.',
    'Its storerooms are open, with tens of thousands of ceramics on the shelves.')

city('Cusco', 'PE', 20)
tip('sight', 'Sacsayhuamán', 'Sacsayhuamán', -13.5094, -71.9819,
    'An Inca fortress above the city with huge stones that fit together without mortar.',
    'Some of the blocks weigh more than 100 tonnes.')
tip('sight', 'Qorikancha', 'Coricancha', -13.5203, -71.9750,
    'The most important temple of the Inca, once covered with sheets of gold.',
    'The Spanish built a church on top of its walls.')

city('Quito', 'EC', 30)
tip('surprise', 'Middle of the World', 'Ciudad Mitad del Mundo', -0.0022, -78.4558,
    'A monument to the equator just north of the city.',
    'GPS shows that the true equator runs about 240 metres away.')
tip('sight', 'Basílica del Voto Nacional', 'Basílica del Voto Nacional', -0.2147, -78.5072,
    'A neo-Gothic church whose gargoyles are Ecuadorian animals such as turtles and armadillos.',
    'You can climb its towers for a view over the old town.')

city('La Paz', 'BO', 20)
tip('sight', 'Mi Teleférico', 'Mi Teleférico', -16.5000, -68.1300,
    'A network of cable cars that is part of everyday transport in this city at about 3,600 metres.',
    'It is the longest urban cable car system in the world.')

city('Santiago', 'CL', 25)
tip('sight', 'San Cristóbal Hill', 'San Cristóbal Hill', -33.4253, -70.6331,
    'A hill in the city with a statue of the Virgin Mary and a view of the Andes.',
    'A funicular from 1925 runs up the hill.')
tip('person', 'La Chascona', 'La Chascona', -33.4310, -70.6346,
    'The house the poet Pablo Neruda built for Matilde Urrutia, full of nooks and odd collections.',
    'It is named after her wild curly hair.',
    person='Pablo Neruda')

city('Honolulu', 'US', 30)
tip('sight', 'Diamond Head', 'Diamond Head', 21.2620, -157.8056,
    'A volcanic crater behind Waikiki Beach; a trail leads up to its rim.',
    'Sailors once mistook calcite crystals on its slopes for diamonds.')
tip('sight', 'USS Arizona Memorial', 'USS Arizona Memorial', 21.3649, -157.9500,
    'A white memorial over the sunken battleship USS Arizona at Pearl Harbor.',
    'Drops of oil still rise from the wreck.')

city('Auckland', 'NZ', 30)
tip('sight', 'Sky Tower', 'Sky Tower (Auckland)', -36.8485, 174.7621,
    'A tower 328 metres tall with a view over the harbour and the volcanoes of the city.',
    'Brave visitors jump from it on a guide wire.')
tip('surprise', 'Rangitoto Island', 'Rangitoto Island', -36.7867, 174.8606,
    'The youngest volcano of Auckland rose from the sea only about 600 years ago.',
    'A ferry takes you over, and a trail leads through lava fields to the summit.')

# ---- Europe, more ----
city('Reykjavík', 'IS', 50)
tip('sight', 'Hallgrímskirkja', 'Hallgrímskirkja', 64.1417, -21.9266,
    'A church whose white tower looks like basalt columns.',
    'Its lift takes you up for a view over the colourful roofs.')
tip('surprise', 'Blue Lagoon', 'Blue Lagoon (geothermal spa)', 63.8804, -22.4495,
    'A warm, milky blue lagoon in a lava field, fed by water from a geothermal power station.',
    'The water is rich in silica, which gives it its colour.')

city('Warsaw', 'PL', 20)
tip('sight', 'Old Town', 'Warsaw Old Town', 52.2497, 21.0122,
    'The old town was almost completely destroyed in 1944 and rebuilt from old paintings and drawings.',
    'UNESCO lists the reconstruction itself as world heritage.')
tip('person', 'Maria Skłodowska-Curie Museum', 'Maria Skłodowska-Curie Museum', 52.2526, 21.0094,
    'The house where Marie Curie was born in 1867; she won two Nobel Prizes.',
    'It shows her life and her research on radioactivity.',
    person='Marie Curie')

city('Budapest', 'HU', 20)
tip('sight', 'Hungarian Parliament Building', 'Hungarian Parliament Building', 47.5071, 19.0456,
    'A huge neo-Gothic parliament on the bank of the Danube.',
    'The Hungarian crown jewels are kept under its dome.')
tip('surprise', 'Széchenyi thermal bath', 'Széchenyi thermal bath', 47.5186, 19.0823,
    'One of the largest thermal baths in Europe, with warm outdoor pools even in winter.',
    'Men play chess in the steaming water.')

places = json.load(open(os.path.join(ROOT, 'site/data/places.json')))
rows = places['rows']
out, n = [], 0
for c in C:
    m = [r for r in rows if r[0] == c['name'] and r[4] == c['cc']]
    assert m, c['name']
    r = max(m, key=lambda r: r[6])
    cid = re.sub(r'[^a-z0-9]+', '-', unicodedata.normalize('NFKD', r[0].lower().replace('ü', 'ue')).encode('ascii', 'ignore').decode()).strip('-')
    tips = []
    for k, t in enumerate(c['tips']):
        tips.append({'id': f'{cid}-{k + 1}', **t})
    n += len(tips)
    out.append({'id': cid, 'name': r[0], 'cc': r[4], 'lat': r[2], 'lon': r[3], 'r': c['r'], 'tips': tips})
note = ('Curated tips for the place popup ("Discover here", F-25). Texts are our own; each tip links to the English Wikipedia '
        'article of the place. Photos: Wikimedia Commons, copied by scripts/fetch-discover-pictures.mjs. Edit tools/discover-tips.py, not this file.')
with open(os.path.join(ROOT, 'site/data/discover.json'), 'w') as f:
    json.dump({'note': note, 'cities': out}, f, ensure_ascii=False, indent=1)
print(len(out), 'cities,', n, 'tips')
