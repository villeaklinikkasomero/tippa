# Tippa

Tippa on A-klinikkasäätiön prototyyppi: maksuton ja anonyymi mobiiliverkkopalvelu, jolla käyttäjä voi seurata omaa alkoholinkäyttöään ja tukea taukoa tai vähentämistä.

Palvelu on staattinen sivusto, eli siinä ei ole palvelinta, tietokantaa eikä build-vaihetta. Kaikki käyttäjän tiedot tallentuvat vain hänen omaan selaimeensa (localStorage).

## Rakenne

```
render.yaml              Renderin asetukset (staattinen sivusto + tietoturvaotsakkeet)
public/
  index.html             Sivun runko
  styles.css             Ulkoasu ja itse isännöidyt fontit
  app.js                 Koko sovelluslogiikka
  manifest.webmanifest   Kotinäytölle lisääminen (PWA)
  sw.js                  Service worker: toimii myös ilman verkkoa
  favicon.svg, icons/    Ikonit
  fonts/                 Baloo 2 ja Figtree (SIL Open Font License)
```

## Julkaisu Renderiin

1. Luo uusi GitHub-repositorio, esimerkiksi `tippa`, ja lisää sinne tämän kansion sisältö (`render.yaml`, `README.md` ja `public/`).
   - Komentorivillä: `git init && git add . && git commit -m "Tippa prototyyppi" && git branch -M main && git remote add origin <repon-osoite> && git push -u origin main`
   - Tai GitHubin verkkosivulla: *Add file > Upload files* ja vedä tiedostot sinne.
2. Kirjaudu Renderiin (render.com) ja yhdistä GitHub-tilisi.
3. Valitse **New > Blueprint**, valitse repositorio ja hyväksy. Render lukee asetukset `render.yaml`-tiedostosta.
   - Vaihtoehto: **New > Static Site**, valitse repo, *Build Command* tyhjäksi tai `echo ok`, *Publish Directory* `public`. Tällöin otsakkeet täytyy lisätä käsin kohdasta *Headers*.
4. Muutaman minuutin päästä palvelu on osoitteessa `https://tippa-xxxx.onrender.com`.

Staattiset sivustot ovat Renderissä maksuttomia, eivätkä ne "nukahda" kuten ilmaiset web-palvelut.

### Päivitykset

Kun muutat tiedostoja ja pusket ne GitHubiin, Render julkaisee uuden version automaattisesti. **Nosta samalla `sw.js`-tiedoston `VERSION`-arvoa** (esim. `tippa-v2`), jotta jo asennetut versiot päivittyvät.

### Oma verkkotunnus

Renderissä: *Settings > Custom Domains*, esimerkiksi `tippa.a-klinikka.fi`. HTTPS-varmenne tulee automaattisesti.

## Tietosuoja ja tietoturva

- Ei rekisteröitymistä, evästeitä, analytiikkaa eikä kolmansien osapuolten palveluita. Fontit ladataan omalta palvelimelta, ei Googlelta.
- Content Security Policy estää ulkoiset skriptit ja yhteydet. Sovellus ei lähetä mitään minnekään.
- Palvelu pyytää selaimelta pysyvää tallennustilaa ja kehottaa lisäämään sovelluksen kotinäytölle. Tämä vähentää riskiä, että selain (etenkin iPhonen Safari) poistaa tiedot.
- Käyttäjä voi ottaa varmuuskopion koodina ja palauttaa sen Asetuksista.

## Ennen julkista käyttöä

- [ ] Poista `index.html`-tiedostosta rivi `<meta name="robots" content="noindex">`, kun palvelu saa näkyä hakukoneissa.
- [ ] Lisää tietosuojaseloste tai -kuvaus (myös ilman henkilötietoja on hyvä kertoa, ettei tietoja kerätä).
- [ ] Tarkista AUDIT-C-kysymysten sanamuodot ja riskirajat Päihdelinkin version kanssa.
- [ ] Lisää Apua-sivulle säätiön omat palvelut (esim. Alkoholilinja) varmistettuine yhteystietoineen.
- [ ] Saavutettavuustarkistus (digipalvelulaki) ja saavutettavuusseloste.
- [ ] Ruotsinkielinen versio.
- [ ] Jos anonyymi tilastointi lisätään, tee ensin tietosuojan vaikutustenarviointi ja päivitä CSP:n `connect-src`.
- [ ] Tarkista Fimean kanssa, kuuluuko palveluohjaus lääkinnällisten laitteiden sääntelyn piiriin.

## Paikallinen testaus

```
cd public
python3 -m http.server 8000
```

Avaa selaimessa http://localhost:8000. Service worker toimii vain localhostissa tai HTTPS:n kautta.
