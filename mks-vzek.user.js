// ==UserScript==
// @name         Meldkamerspel - Voertuig Zoeken en Kopen
// @namespace    http://tampermonkey.net/
// @version      1.2
// @author       MKBN
// @license      Beerware 
// @description  Controleer op specifiek voertuig_type_id in de kazerne en als deze ontbreekt koop deze dan met credits.
// @homepage     https://github.com/MKBN-1/mks-mkbn/
// @homepageURL  https://github.com/MKBN-1/mks-mkbn/
// @supportURL   https://github.com/MKBN-1/mks-mkbn/issues
// @downloadURL  https://raw.githubusercontent.com/MKBN-1/mks-mkbn/refs/heads/main/mks-vzek.user.js
// @updateURL    https://raw.githubusercontent.com/MKBN-1/mks-mkbn/refs/heads/main/mks-vzek.user.js
// @match        https://www.meldkamerspel.com/buildings/*
// @grant        none
/*
 * -------------------------------------------------------------------------------
 * "THE BEER-WARE LICENSE" (Revision 42):
 * <barbarossa@freedom.nl> wrote this file.  As long as you retain this notice you
 * can do whatever you want with this stuff. If we meet some day, and you think
 * this stuff is worth it, you can buy me a beer in return. MKBN aka Barbarossa
 * -------------------------------------------------------------------------------

 Release Notes:

 Versie: 1.2
 Datum 2024-12-18
 - Upload en share op github

UITLEG
 Begin bij de eerste brandweerkazerne die je gebouwt hebt en open deze in een nieuwe venster of tabblad
 Om te checken, de URL lijkt dan op https://www.meldkamerspel.com/buildings/XXXXXX
 Kies daarna hier een vehicle_type_id dat je toe wilt voegen. Als voorbeeld een paar ID's. Dit zijn ze niet allemaal maar je bent vast slim genoeg
 om de rest zelf te vinden.

 2 = Autoladder (AL)
 3 = Officier van Dienst - Brandweer (DA-OVD)
 4 = Hulpverleningsvoertuig (HV)
 5 = Adembeschermingsvoertuig (AB)
 10 = Slangenwagen (SL)
 11 = Dienstbus Verkenningseenheid Brandweer (DB-VEB)
 18 = Hoogwerker (HW)
 19 = Hoofd Officier van Dienst - Brandweer (DA-HOD)
 20 = Dienstauto (4 personen) (DA)
 21 = Dienstbus klein (9 personen) (DB-K)
 24 = Adviseur Gevaarlijke Stoffen - Brandweer (DA-AGS)
 31 = Commandovoertuig (CO)
 34 = Watertankwagen (WT)
 56 = Dienstauto Voorlichter (DA-VL)
 62 = Tankautospuit-Hulpverlening (TS-HV)
 71 = Motorspuitaanhanger (MSA)
 72 = Dompelpompaanhangwagen (DPA)
 83 = Signalisatievoertuig (DA-SIG)
 90 = Tankautospuit – Specialisme Technische Hulpverlening (TS-STH)


 Vul de gekozen ID in bij targetVehicleTypeId een paar regels verder.

 Vul de building_id in van de laatste kazerne
*/

// ==/UserScript==

(function() {
    'use strict';
    // ********************************************
    // HIER ONDER EERST DE VARIABELEN DEFINIEREN!!!
    // ZIE UITLEG
    // ********************************************
    
    // Definieer hier het gewenste vehicle_type_id
    const targetVehicleTypeId = "88";
    // Definieer hier het laatste gebouw wat je gebouwd hebt om het script op tijd te laten stoppen
    const lastStop = "0123456";

    // **********************************************************************
    // TOT HIER EN NIET VERDER. HIER ONDER IETS WIJZIGEN IS OP EIGEN RISICO!!
    // **********************************************************************
    
    // Functie om de kazerne_id uit de URL te halen
    function getKazerneId() {
        const url = window.location.href;
        return url.split('/').pop();
    }

    // Functie om de kazerneNaam uit het <h1> element te halen
    function getKazerneNaam() {
        const h1Element = document.querySelector('h1[building_type="0"]');
        if (h1Element) {
            const fullName = h1Element.textContent.trim();
            const nameParts = fullName.split(" - ");
            return nameParts.length > 1 ? nameParts[1] : fullName;
        }
        console.error("Kazerne naam niet gevonden.");
        return "";
    }
    // Functie om te controleren of het voertuig met targetVehicleTypeId bestaat in de actieve tab
    function checkVehicleExists() {
        const vehicleRows = document.querySelectorAll('table tbody tr');

        for (const row of vehicleRows) {
            const vehicleTypeIdElement = row.querySelector('[vehicle_type_id]');
            if (vehicleTypeIdElement) {
                const vehicleTypeId = vehicleTypeIdElement.getAttribute('vehicle_type_id');
                if (vehicleTypeId === targetVehicleTypeId) {  // Gebruik de variabele hier
                    return true; // Voertuig gevonden
                    console.log(`Voertuig al in de kazerne`);
                }
            }
        }
        return false; // Voertuig niet gevonden
    }

    // Hoofdproces
    const kazerneId = getKazerneId();
    const kazerneNaam = getKazerneNaam();

    const vehicleExists = checkVehicleExists();

    // Log de kazerneId en kazerneNaam naar de console
    console.log(`Kazerne ID: ${kazerneId}`);
    console.log(`Kazerne Naam: ${kazerneNaam}`);

    if (!vehicleExists) {
        const postUrl = `https://www.meldkamerspel.com/buildings/${kazerneId}/vehicle/${kazerneId}/${targetVehicleTypeId}/credits?building=${kazerneId}`;

        console.log(`Post URL: ${postUrl}`);

        fetch(postUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if (response.ok) {
                console.log(`POST-verzoek succesvol naar: ${postUrl}`);
            } else {
                console.error(`Fout bij het POST-verzoek: ${response.status} ${response.statusText}`);
            }
        })
        .catch(error => {
            console.error(`Fout tijdens het verzenden van het POST-verzoek: ${error}`);
        });
    } else {
        console.log(`Voertuig met vehicle_type_id ${targetVehicleTypeId} bestaat al, script gestopt.`);
    }

    // Pauze van 750 milliseconden voordat de volgende pagina wordt geladen of het script stopt
    setTimeout(() => {
        if (kazerneId === lastStop) {
            console.log("We zijn aan het eind van de reis gekomen");
            return; // Stop het script hier
        }

        const nextBuildingLink = Array.from(document.querySelectorAll('a')).find(link => link.textContent.includes('Volgende gebouw'));
        if (nextBuildingLink) {
            nextBuildingLink.click();
        } else {
            console.error("Volgende gebouw link niet gevonden.");
        }
    }, 750);

})();