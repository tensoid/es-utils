type Bits3 = Array<'-' | '0' | '1'>;

interface MintermTableRow {
  minterms: Set<number>,
  bits: Bits3,
  combined: boolean
}

type MintermTable = Array<MintermTableRow>;

/**
 * Minimizes a logical function using the Quine-McCluskey Algorithm.
 * @param inputNames 
 * @param minterms 
 * @returns The minimized logical expression
 */
export function computeMcClusky(inputNames: Array<string>, minterms: Set<number>, dontCares: Set<number>): string {

  if(minterms.size == 0) return "0";
  if(minterms.size + dontCares.size == Math.pow(2, inputNames.length)) return "1";

  // Step 1: finding prime implicants

  let mintermTables: Array<MintermTable> = [];

  // create first table
  let initialMintermTable: MintermTable = [];
  [...minterms, ...dontCares].forEach(minterm => {
    initialMintermTable.push({
      minterms: new Set([minterm]),
      bits: minterm.toString(2).padStart(inputNames.length, '0').split('') as Bits3,
      combined: false
    });
  });

  mintermTables.push(initialMintermTable);

  for(let iteration = 1;; iteration++) {

    // create new table
    mintermTables.push([]);

    // get each combination
    mintermTables[iteration - 1].forEach((row, i) => {
      mintermTables[iteration - 1].slice(i + 1).forEach(otherRow => {
        // check if bit difference is 1
        let bitDifferences = getBitDifferences(row.bits, otherRow.bits);
        if(bitDifferences.length > 1) return;

        // add row to next table
        mintermTables[iteration].push({
          minterms: new Set([...row.minterms, ...otherRow.minterms]),
          bits: row.bits.map((bit, bitIndex) => bitIndex == bitDifferences[0] ? '-' : bit),
          combined: false
        });

        // mark both rows as combined
        row.combined = true;
        otherRow.combined = true;
      });
    });
          
    // check if finished combining
    if(mintermTables[iteration].length == 0) {
      mintermTables.pop();
      break;
    }
  }

  // Step 2: prime implicant chart

  let primeImplicants = mintermTables.flat().filter(row => !row.combined);
  let essentialPrimeImplicants = primeImplicants.filter(pi => {
    // check if a minterm exists that is in no other prime implicant
    return [...pi.minterms].find(mt => {
      if([...dontCares].includes(mt)) return false;
      return primeImplicants.flatMap(pi2 => [...pi2.minterms]).filter(mt2 => mt2 == mt).length == 1;
    }) != undefined;
  });

  let notCoveredMinterms: Set<number> = new Set([...minterms].filter(mt => {
    return !essentialPrimeImplicants.flatMap(pi => [...pi.minterms]).includes(mt);
  }));

  if(notCoveredMinterms.size > 0) {
    let primeImplicantsPowerSet = getPowerSet(new Set(primeImplicants)).map(set => [...set]);
    let coveringPrimeImplicantsPowerSet = primeImplicantsPowerSet.filter(pis => {
      let coveredMinterms = pis.flatMap(pi => [...pi.minterms]);
      return [...notCoveredMinterms].every(minterm => coveredMinterms.includes(minterm));
    });
    
    coveringPrimeImplicantsPowerSet.sort((a, b) => b.length - a.length);
    coveringPrimeImplicantsPowerSet.sort((a, b) => a.flatMap(m => m.minterms).length - b.flatMap(m => m.minterms).length);

    essentialPrimeImplicants.push(...coveringPrimeImplicantsPowerSet[0]);
  }
  
  // convert essential prime implicants to expression string
  return essentialPrimeImplicants.map(pi => {
    let conjunction = pi.bits.map((bit, bitIndex) => {
      if(bit == '-') return "";
      else if(bit == '0') return `¬${inputNames[bitIndex]}`;
      else return `${inputNames[bitIndex]}`;
    }).filter(c => c != "").join(" ∧ ");
    
    return "(" + conjunction + ")";
  }).join(" ∨ ");
}

function getBitDifferences(input1: Bits3, input2: Bits3): Array<number> {

  let differences: Array<number> = [];

  input1.forEach((bit, index) => {
    if(bit != input2[index]) differences.push(index);
  });

  return differences;
}

function getPowerSet<T>(set: Set<T>): Array<Set<T>> {
  return [...set].reduce(
      (subsets, value) => subsets.concat(subsets.map(subset => [value,...subset])),[[]] as Array<Array<T>>)
      .map(arr => new Set(arr));
}