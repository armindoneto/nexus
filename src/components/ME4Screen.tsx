import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Trash2, 
  X, 
  Check, 
  RefreshCw, 
  UserX, 
  UserCheck, 
  ChevronUp, 
  Info,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Person {
  nr: number;       // Original Rank (NR)
  nrOrd: string;    // Order Number (Nr Ord)
  nome: string;     // Name (NOME)
  media: string;    // Average (MÉDIA)
}

interface Exclusion {
  nrOrd: string;
  reason: string;
  timestamp: string;
}

const INITIAL_PEOPLE: Person[] = [
  { nr: 1, nrOrd: '6158226', nome: 'LAÍS SANTIAGO FRANÇA', media: '9,2971' },
  { nr: 2, nrOrd: '6158285', nome: 'LEONARDO BRASILEIRO DIAS', media: '9,2347' },
  { nr: 3, nrOrd: '6059260', nome: 'VINNE SOUZA DE OLIVEIRA', media: '9,1300' },
  { nr: 4, nrOrd: '6158927', nome: 'LÍDIA FELIX VIEIRA', media: '9,1000' },
  { nr: 5, nrOrd: '6158234', nome: 'LUIZ GUSTAVO DA SILVA BEZERRA', media: '9,0082' },
  { nr: 6, nrOrd: '6158579', nome: 'CAROLINE RUSSELL VASCONCELOS', media: '8,9076' },
  { nr: 7, nrOrd: '6158463', nome: 'VERONICA GARCIA NAZIAZENO', media: '8,9071' },
  { nr: 8, nrOrd: '6159176', nome: 'JHENYFFER SOARES MARQUI', media: '8,8912' },
  { nr: 9, nrOrd: '6158676', nome: 'JULIA NASCIMENTO PORTELLA', media: '8,8600' },
  { nr: 10, nrOrd: '6157971', nome: 'CAROLINE VIANE DA SILVA', media: '8,8259' },
  { nr: 11, nrOrd: '6158757', nome: 'MATHEUS SILVA TEIXEIRA DOS SANTOS', media: '8,8247' },
  { nr: 12, nrOrd: '6158919', nome: 'LETÍCIA LOPES SANTOS', media: '8,8041' },
  { nr: 13, nrOrd: '6159346', nome: 'EVANDRO RIBEIRO BATISTA', media: '8,8000' },
  { nr: 14, nrOrd: '6158587', nome: 'ARMINDO JOSÉ MARTINS PEREIRA NETO', media: '8,7288' },
  { nr: 15, nrOrd: '6158382', nome: 'ANA PAULA AURELIANO DA SILVA', media: '8,7106' },
  { nr: 16, nrOrd: '4192451', nome: 'CLAUDENIR JOSÉ DA SILVA', media: '8,7053' },
  { nr: 17, nrOrd: '6158609', nome: 'SALOMÃO BARCELOS DA SILVEIRA', media: '8,6806' },
  { nr: 18, nrOrd: '6158323', nome: 'AMANNDA MAYARA DE AMORIM SILVA DOS SANTOS', media: '8,6788' },
  { nr: 19, nrOrd: '6158250', nome: 'GABRIEL ANDRADE TORREIRO', media: '8,6659' },
  { nr: 20, nrOrd: '6158340', nome: 'VANESSA TORRES MAIA', media: '8,6312' },
  { nr: 21, nrOrd: '6179614', nome: 'MAÍRA SILIPRANDI VIANNA', media: '8,6294' },
  { nr: 22, nrOrd: '4315430', nome: 'DIEGO DA SILVA GOULART', media: '8,5971' },
  { nr: 23, nrOrd: '6158706', nome: 'VINÍCIUS COSTA DE SOUZA', media: '8,5941' },
  { nr: 24, nrOrd: '6170277', nome: 'ANA CAROLINE PERMÍNIO ANTÃO', media: '8,5729' },
  { nr: 25, nrOrd: '6158013', nome: 'FERNANDA MONDELO DA SILVA', media: '8,5694' },
  { nr: 26, nrOrd: '6158552', nome: 'JAIRO MONSORES DOS SANTOS', media: '8,5347' },
  { nr: 27, nrOrd: '6159290', nome: 'LUIS FELIPE TORRES DA ROCHA CASTRO', media: '8,5306' },
  { nr: 28, nrOrd: '6159036', nome: 'RAFAEL DA SILVA BARBOSA', media: '8,5265' },
  { nr: 29, nrOrd: '6158617', nome: 'ROBERTA CRISTINA DOS SANTOS SOARES', media: '8,4988' },
  { nr: 30, nrOrd: '6158684', nome: 'CARMEN GUEDES MIRANDA', media: '8,4959' },
  { nr: 31, nrOrd: '6158641', nome: 'LUCAS PENA AFONSO', media: '8,4906' },
  { nr: 32, nrOrd: '6158668', nome: 'DIEGO DO NASCIMENTO PEREIRA', media: '8,4829' },
  { nr: 33, nrOrd: '6158773', nome: 'LUCAS GOMES DE SANT\'ANNA', media: '8,4694' },
  { nr: 34, nrOrd: '6158412', nome: 'ANA CAROLINA SILVEIRA GONÇALVES', media: '8,4676' },
  { nr: 35, nrOrd: '6158048', nome: 'FELIPE LOPES DE LIMA', media: '8,4641' },
  { nr: 36, nrOrd: '6158374', nome: 'FELIPE JOSÉ DE OLIVEIRA LIMA', media: '8,4382' },
  { nr: 37, nrOrd: '6158331', nome: 'ALEXANDRE IWASSE SILVESTRE', media: '8,4371' },
  { nr: 38, nrOrd: '6179665', nome: 'GABRIEL BRASIL ROCHA ANTUNES', media: '8,4035' },
  { nr: 39, nrOrd: '4193121', nome: 'CRISPIM GALDINO DE OLIVEIRA NETO', media: '8,3865' },
  { nr: 40, nrOrd: '6159150', nome: 'DANYLO DA SILVA NASCIMENTO', media: '8,3759' },
  { nr: 41, nrOrd: '6158188', nome: 'CAROLINE RIBEIRO ALVES', media: '8,3476' },
  { nr: 42, nrOrd: '4251156', nome: 'RAFAEL GOULART DOS REIS', media: '8,3347' },
  { nr: 43, nrOrd: '6158153', nome: 'SAURO PEREIRA DOS SANTOS', media: '8,3324' },
  { nr: 44, nrOrd: '4402510', nome: 'LUÍS FERNANDO ELIAS DA MATA', media: '8,3153' },
  { nr: 45, nrOrd: '6158722', nome: 'FERNANDA SILVA DE OLIVEIRA', media: '8,2953' },
  { nr: 46, nrOrd: '6158994', nome: 'MARIANE DIAS SPIRIDIGLIOZZI', media: '8,2906' },
  { nr: 47, nrOrd: '6170285', nome: 'ALEX BRUNO DA COSTA PENHA', media: '8,2594' },
  { nr: 48, nrOrd: '6158145', nome: 'JÔNATHAS SANT\'ANA DOS SANTOS', media: '8,2547' },
  { nr: 49, nrOrd: '6158242', nome: 'ARTHUR FILLIPOS DE SOUZA ALBUQUERQUE', media: '8,2518' },
  { nr: 50, nrOrd: '6159125', nome: 'VANESSA CRISTINE DE SOUZA DO ESPIRITO SANTO', media: '8,2388' },
  { nr: 51, nrOrd: '6158072', nome: 'ANA KARINE CARNEIRO DE ALMEIDA', media: '8,2194' },
  { nr: 52, nrOrd: '6158730', nome: 'THAIZA CORDEIRO DE OLIVEIRA', media: '8,2141' },
  { nr: 53, nrOrd: '6158633', nome: 'AMANDA DOS SANTOS GOMES', media: '8,2029' },
  { nr: 54, nrOrd: '6158978', nome: 'MATHEUS DE LIMA SILVA', media: '8,2006' },
  { nr: 55, nrOrd: '6157980', nome: 'MARIELE FREITAS LEITE', media: '8,1841' },
  { nr: 56, nrOrd: '6159095', nome: 'LETÍCIA CLAUDINO MARTINI', media: '8,1818' },
  { nr: 57, nrOrd: '6159206', nome: 'GABRIEL TORRES PEREIRA SARAIVA', media: '8,1759' },
  { nr: 58, nrOrd: '6159087', nome: 'RAFAELA DE ALMEIDA SILVA', media: '8,1712' },
  { nr: 59, nrOrd: '6158110', nome: 'TAYANE REOLON DA SILVA', media: '8,1665' },
  { nr: 60, nrOrd: '6158200', nome: 'HELLEN REGINA AMORIM DOS SANTOS', media: '8,1518' },
  { nr: 61, nrOrd: '6158129', nome: 'LÍGIA LEAL RIBEIRO', media: '8,1406' },
  { nr: 62, nrOrd: '6159257', nome: 'CAROLYNA DA SILVA MORAIS', media: '8,1388' },
  { nr: 63, nrOrd: '6158196', nome: 'PEDRO HENRIQUE LOURENÇO DE MENDONÇA', media: '8,1312' },
  { nr: 64, nrOrd: '670293', nome: 'POLYANA MAYARA RODRIGUES DA COSTA', media: '8,1288' },
  { nr: 65, nrOrd: '6159320', nome: 'PENHA REGINA LEÃO DOS SANTOS', media: '8,1041' },
  { nr: 66, nrOrd: '6159222', nome: 'WASHINGTON NORBERTO OLIVEIRA SILVA', media: '8,0935' },
  { nr: 67, nrOrd: '6158765', nome: 'VINICIUS FERNANDES GUIMARÃES', media: '8,0912' },
  { nr: 68, nrOrd: '6158161', nome: 'PATRICIA DA SILVA BATISTA', media: '8,0841' },
  { nr: 69, nrOrd: '6158790', nome: 'BIANCA MARTINS ALVES DA COSTA', media: '8,0835' },
  { nr: 70, nrOrd: '6158854', nome: 'RAÍSA PELICIONI GUIMARÃES', media: '8,0747' },
  { nr: 71, nrOrd: '6158447', nome: 'ANA CLARA DO NASCIMENTO RODRIGUES', media: '8,0741' },
  { nr: 72, nrOrd: '6158064', nome: 'ELIFAS LEVI BATISTA', media: '8,0588' },
  { nr: 73, nrOrd: '6158501', nome: 'ROBERTA DOS SANTOS NOISES', media: '8,0500' },
  { nr: 74, nrOrd: '6158080', nome: 'GIOVANNI COCCO ALVES', media: '8,0412' },
  { nr: 75, nrOrd: '6158625', nome: 'ANDERSON BRUNO SILVA OLIVEIRA', media: '8,0294' },
  { nr: 76, nrOrd: '6159044', nome: 'ROBERT CARDOSO GAMA', media: '8,0182' },
  { nr: 77, nrOrd: '6158960', nome: 'RODOLFO JOSÉ BOSSERT', media: '8,0141' },
  { nr: 78, nrOrd: '6158170', nome: 'STEFANY BASTOS SOUZA', media: '7,9835' },
  { nr: 79, nrOrd: '6158889', nome: 'ALEXANDRE ASLAN OLIVEIRA DE SOUZA', media: '7,9765' },
  { nr: 80, nrOrd: '6158102', nome: 'DAVI LESLIE VILAR GONDIM', media: '7,9753' },
  { nr: 81, nrOrd: '6158390', nome: 'VALÉRIA TORRES MAIA', media: '7,9671' },
  { nr: 82, nrOrd: '6159192', nome: 'GIULIA SANTOS SOUZA', media: '7,9559' },
  { nr: 83, nrOrd: '6157998', nome: 'LISA CAVALCANTI DE AGUIAR CASTRO', media: '7,9541' },
  { nr: 84, nrOrd: '6158749', nome: 'MARINA BARBOSA MONTEIRO DE OLIVEIRA', media: '7,9459' },
  { nr: 85, nrOrd: '6179576', nome: 'ALINE SILVA BATISTA', media: '7,9324' },
  { nr: 86, nrOrd: '6159010', nome: 'PEDRO HENRIQUE ROMEIRO DE OLIVEIRA', media: '7,9218' },
  { nr: 87, nrOrd: '6158455', nome: 'DEBORA JEMIMA MARINHO TAVARES', media: '7,9206' },
  { nr: 88, nrOrd: '6159214', nome: 'RAYSSA LOPES DOS SANTOS', media: '7,9200' },
  { nr: 89, nrOrd: '4258983', nome: 'FELIPE COSTA PEREIRA', media: '7,9076' },
  { nr: 90, nrOrd: '6158420', nome: 'BRUNA PINTO DA SILVA', media: '7,9041' },
  { nr: 91, nrOrd: '6158900', nome: 'ELIETE BALBINO DE LIMA', media: '7,9024' },
  { nr: 92, nrOrd: '6159109', nome: 'PRISCYLA CLARA SILVA MOTTA', media: '7,8982' },
  { nr: 93, nrOrd: '6158005', nome: 'WILDE DALVA ALVES DE LIRA', media: '7,8888' },
  { nr: 94, nrOrd: '6158366', nome: 'GABRIEL PORTELA DE CARVALHO', media: '7,8747' },
  { nr: 95, nrOrd: '6159249', nome: 'MAURICIO MENDONÇA DE OLIVEIRA', media: '7,8729' },
  { nr: 96, nrOrd: '6159184', nome: 'JÉSSICA MARTINS DA SILVA', media: '7,8729' },
  { nr: 97, nrOrd: '6158692', nome: 'THAIS DUTRA LACERDA', media: '7,8565' },
  { nr: 98, nrOrd: '6158846', nome: 'JOYCE MARINHO BARBOSA', media: '7,8382' },
  { nr: 99, nrOrd: '6158056', nome: 'LORENA SILVA DE SOUZA', media: '7,8241' },
  { nr: 100, nrOrd: '6158439', nome: 'THAIS CRISTINA MACEDO VALIANTE', media: '7,8147' },
  { nr: 101, nrOrd: '6179673', nome: 'ARTHUR CARLOS MARQUES RIBEIRO', media: '7,8035' },
  { nr: 102, nrOrd: '6159168', nome: 'TIAGO ROGÉRIO PINTO DE CARVALHO', media: '7,8018' },
  { nr: 103, nrOrd: '6159060', nome: 'LEANDRO SEIJI IKEUTI', media: '7,7976' },
  { nr: 104, nrOrd: '6179649', nome: 'BRUNA DE OLIVEIRA SOUTO MAIOR', media: '7,7853' },
  { nr: 105, nrOrd: '6170315', nome: 'JULIANA ARANTES DA ROCHA', media: '7,7471' },
  { nr: 106, nrOrd: '6159311', nome: 'GLEUBER EZEQUIEL PIRES MUNIZ', media: '7,7394' },
  { nr: 107, nrOrd: '6158021', nome: 'BÁRBARA DANIELA DA ROSA', media: '7,7371' },
  { nr: 108, nrOrd: '6179568', nome: 'RAFAEL BRITES ALMEIDA', media: '7,7341' },
  { nr: 109, nrOrd: '6165044', nome: 'ARIANNE MADEIRA PEREIRA', media: '7,7224' },
  { nr: 110, nrOrd: '6159117', nome: 'MAUI MAGALHÃES CASELLA', media: '7,7153' },
  { nr: 111, nrOrd: '6159141', nome: 'BRUNO FREIRE PROENÇA', media: '7,6859' },
  { nr: 112, nrOrd: '6179584', nome: 'LORENA CORRÊA DE ARAÚJO E SILVA', media: '7,6824' },
  { nr: 113, nrOrd: '6158838', nome: 'DAIANA FRAGA MUSSURI', media: '7,6812' },
  { nr: 114, nrOrd: '6159338', nome: 'JESSÂNIA IRINEU DA SILVA', media: '7,6435' },
  { nr: 115, nrOrd: '6157963', nome: 'JOSÉ CARLOS CRUZ GONZAGA JUNIOR', media: '7,5988' },
  { nr: 116, nrOrd: '6158803', nome: 'CAIO DOS SANTOS SAMPAIO', media: '7,5988' },
  { nr: 117, nrOrd: '6159303', nome: 'MURILO LOPES BORGES', media: '7,5865' },
  { nr: 118, nrOrd: '6158714', nome: 'MAURICIO DOS SANTOS DA SILVA', media: '7,5818' },
  { nr: 119, nrOrd: '6158358', nome: 'JÉSSICA MAYARA GURGEL DE OLIVEIRA', media: '7,5653' },
  { nr: 120, nrOrd: '6158293', nome: 'LEONARDO DE SOUZA LUCENA', media: '7,5306' },
  { nr: 121, nrOrd: '6158498', nome: 'ROBSON COSTA CASSEMIRO', media: '7,4912' },
  { nr: 122, nrOrd: '6158544', nome: 'GLAUCIA COSTA DOS ANJOS', media: '7,4888' },
  { nr: 123, nrOrd: '6179630', nome: 'STÉPHANIE FARIA RODRIGUES', media: '7,4565' },
  { nr: 124, nrOrd: '6159133', nome: 'AGUINALDO JOSÉ DE FREITAS JÚNIOR', media: '7,4447' },
  { nr: 125, nrOrd: '6179657', nome: 'ROBERTA CAMILA CAROLO DOS SANTOS', media: '7,4247' },
  { nr: 126, nrOrd: '6158897', nome: 'ANDRESSA RICARDO MESQUITA', media: '7,4112' },
  { nr: 127, nrOrd: '6158781', nome: 'GUTTYERRY TAVARES RABELO', media: '7,4047' },
  { nr: 128, nrOrd: '6158307', nome: 'FRANCISCO FERREIRA GOMES NETO', media: '7,3894' },
  { nr: 129, nrOrd: '6158510', nome: 'JEANE DA SILVA ALMEIDA DA COSTA', media: '7,3729' },
  { nr: 130, nrOrd: '6158480', nome: 'ROSANE MARTINS REZENDE', media: '7,3712' },
  { nr: 131, nrOrd: '6158820', nome: 'RUAN MIGUEL SANTANA PEIXOTO', media: '7,3471' },
  { nr: 132, nrOrd: '6159265', nome: 'LUÍS GUSTAVO DOS SANTOS', media: '7,3471' },
  { nr: 133, nrOrd: '6159079', nome: 'VANESSA COSTA ROSA', media: '7,3341' },
  { nr: 134, nrOrd: '6158404', nome: 'VITÓRIA STEFHANIE BARBOSA DE MOURA CRUZ', media: '7,3300' },
  { nr: 135, nrOrd: '6158030', nome: 'ANA LÍVIA BRASIL SILVÉRIO', media: '7,3076' },
  { nr: 136, nrOrd: '6158986', nome: 'THAMARYS DE AZEVEDO NOGUEIRA', media: '7,2965' },
  { nr: 137, nrOrd: '6158471', nome: 'FERNANDA CRISTINA MOREIRA PEREIRA', media: '7,2935' },
  { nr: 138, nrOrd: '6158811', nome: 'ANNA KAROLLINE ARARUNA DO NASCIMENTO', media: '7,2847' },
  { nr: 139, nrOrd: '6157947', nome: 'BRUNO ROBERTO DE SOUZA SOARES', media: '7,2782' },
  { nr: 140, nrOrd: '6158870', nome: 'RARUMY APARECIDA LEIRA VALERIO', media: '7,2741' },
  { nr: 141, nrOrd: '6179622', nome: 'PEDRO FLOR DOS SANTOS', media: '7,2741' },
  { nr: 142, nrOrd: '6158269', nome: 'BÁRBARA DAYANE GARCIA CORRÊA', media: '7,2506' },
  { nr: 143, nrOrd: '6157955', nome: 'JAYSON AUGUSTO DIAS DA SILVA', media: '7,2488' },
  { nr: 144, nrOrd: '6158951', nome: 'LAYS DE VASCONCELOS MARCONDES DOS SANTOS', media: '7,2247' },
  { nr: 145, nrOrd: '6158862', nome: 'GABRIELLA WINNIE SILVA DOS SANTOS', media: '7,2224' },
  { nr: 146, nrOrd: '6158560', nome: 'ALANA LEIZIE MATTOS DE FIGUEIREDO', media: '7,1806' },
  { nr: 147, nrOrd: '6158528', nome: 'DIEGO CLAUDINO CALIXTO', media: '7,1771' },
  { nr: 148, nrOrd: '6159052', nome: 'GRAZIELLA SOUSA FERNANDES DE PAIVA', media: '7,1759' },
  { nr: 149, nrOrd: '6179592', nome: 'MARLUCE FABIANA LÔBO', media: '7,1647' },
  { nr: 150, nrOrd: '6158277', nome: 'RAMON FERREIRA LIMA', media: '7,1518' },
  { nr: 151, nrOrd: '6159281', nome: 'CLAUDIO MAGALHÃES CASELLA', media: '7,0906' },
  { nr: 152, nrOrd: '6158935', nome: 'ANDRE LUIS VITAL ALVES DE ARAUJO', media: '7,0576' },
  { nr: 153, nrOrd: '6158650', nome: 'KAROLINE DE FREITAS GUERRA', media: '7,0512' },
  { nr: 154, nrOrd: '6158943', nome: 'RAFAEL PALOMARES', media: '7,0241' },
  { nr: 155, nrOrd: '6158595', nome: 'ALINE MOURÃO DA MOTTA', media: '7,0206' },
  { nr: 156, nrOrd: '6158536', nome: 'JOÃO CARLOS DOS SANTOS BARROS', media: '6,9924' },
  { nr: 157, nrOrd: '6179606', nome: 'DIANE CARNEIRO DA COSTA', media: '6,9153' },
  { nr: 158, nrOrd: '6159028', nome: 'FABRICIO HENRIQUE DA SILVA DE LEMOS', media: '6,8688' },
  { nr: 159, nrOrd: '6159001', nome: 'HÉLIDE TATIANE ZUCARELLI', media: '6,8306' },
  { nr: 160, nrOrd: '6158315', nome: 'HELDER ESTELITA LINS', media: '6,6412' }
];

interface ME4ScreenProps {
  exclusions?: Exclusion[];
  setExclusions?: React.Dispatch<React.SetStateAction<Exclusion[]>>;
  highlights?: string[];
  setHighlights?: React.Dispatch<React.SetStateAction<string[]>>;
  theme?: 'light' | 'dark';
}

export default function ME4Screen({ 
  exclusions: externalExclusions, 
  setExclusions: externalSetExclusions,
  highlights: externalHighlights,
  setHighlights: externalSetHighlights,
  theme = 'dark'
}: ME4ScreenProps) {
  const [people] = useState<Person[]>(INITIAL_PEOPLE);
  const [internalExclusions, internalSetExclusions] = useState<Exclusion[]>(() => {
    try {
      const saved = localStorage.getItem('nocturne_me4_exclusions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const exclusions = externalExclusions !== undefined ? externalExclusions : internalExclusions;
  const setExclusions = externalSetExclusions !== undefined ? externalSetExclusions : internalSetExclusions;

  const [internalHighlights, internalSetHighlights] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nocturne_me4_highlights');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const highlights = externalHighlights !== undefined ? externalHighlights : internalHighlights;
  const setHighlights = externalSetHighlights !== undefined ? externalSetHighlights : internalSetHighlights;

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'excluded'>('all');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [reasonInput, setReasonInput] = useState('');
  
  // Persist exclusions
  useEffect(() => {
    localStorage.setItem('nocturne_me4_exclusions', JSON.stringify(exclusions));
  }, [exclusions]);

  // Persist highlights
  useEffect(() => {
    localStorage.setItem('nocturne_me4_highlights', JSON.stringify(highlights));
  }, [highlights]);

  // Map exclusions for super fast lookup
  const exclusionMap = useMemo(() => {
    const map = new Map<string, string>();
    exclusions.forEach(e => map.set(e.nrOrd, e.reason));
    return map;
  }, [exclusions]);

  // Calculate dynamic rankings
  // The rankings recalculate based ONLY on active (non-excluded) people.
  // Their relative order is preserved based on their original ranking (which matches the INITIAL_PEOPLE list).
  const dynamicRankings = useMemo(() => {
    const newRanks = new Map<string, { newRank: number; upShifts: number }>();
    
    let activeIndex = 0;
    people.forEach((person) => {
      const isExcluded = exclusionMap.has(person.nrOrd);
      if (!isExcluded) {
        activeIndex++;
        const originalRank = person.nr;
        const newRank = activeIndex;
        const upShifts = originalRank - newRank;
        newRanks.set(person.nrOrd, { newRank, upShifts });
      } else {
        // Excluded people don't get a new rank
        newRanks.set(person.nrOrd, { newRank: -1, upShifts: 0 });
      }
    });

    return newRanks;
  }, [people, exclusionMap]);

  // Filter and process the final list
  const filteredPeople = useMemo(() => {
    return people.filter(person => {
      const isExcluded = exclusionMap.has(person.nrOrd);
      
      // Filter by tab
      if (activeTab === 'active' && isExcluded) return false;
      if (activeTab === 'excluded' && !isExcluded) return false;

      // Filter by search term
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchesName = person.nome.toLowerCase().includes(term);
        const matchesOrd = person.nrOrd.includes(term);
        const exclusionReason = exclusionMap.get(person.nrOrd) || '';
        const matchesReason = exclusionReason.toLowerCase().includes(term);
        return matchesName || matchesOrd || matchesReason;
      }

      return true;
    });
  }, [people, exclusionMap, activeTab, searchTerm]);



  // Stats
  const stats = useMemo(() => {
    const total = people.length;
    const excludedCount = exclusions.length;
    const activeCount = total - excludedCount;
    return { total, excludedCount, activeCount };
  }, [people, exclusions]);

  // Open modal for exclusion
  const handleNameClick = (person: Person) => {
    setSelectedPerson(person);
    const existingReason = exclusionMap.get(person.nrOrd) || '';
    setReasonInput(existingReason);
  };

  // Toggle row highlight (purple tone)
  const toggleHighlight = (nrOrd: string) => {
    setHighlights(prev => {
      if (prev.includes(nrOrd)) {
        return prev.filter(id => id !== nrOrd);
      } else {
        return [...prev, nrOrd];
      }
    });
  };

  // Submit exclusion
  const handleExclusionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPerson) return;

    if (reasonInput.trim() === '') {
      // Remove exclusion if empty
      setExclusions(prev => prev.filter(x => x.nrOrd !== selectedPerson.nrOrd));
    } else {
      const existing = exclusions.find(x => x.nrOrd === selectedPerson.nrOrd);
      if (existing) {
        setExclusions(prev => prev.map(x => x.nrOrd === selectedPerson.nrOrd ? { ...x, reason: reasonInput } : x));
      } else {
        setExclusions(prev => [
          ...prev,
          {
            nrOrd: selectedPerson.nrOrd,
            reason: reasonInput,
            timestamp: new Date().toISOString()
          }
        ]);
      }
    }
    setSelectedPerson(null);
    setReasonInput('');
  };

  // Toggle active/inactive straight away (quick action)
  const handleRemoveExclusion = (nrOrd: string) => {
    setExclusions(prev => prev.filter(x => x.nrOrd !== nrOrd));
  };

  const clearAllExclusions = () => {
    if (window.confirm('Tem certeza de que deseja restaurar toda a lista e limpar as exclusões?')) {
      setExclusions([]);
    }
  };

  return (
    <div className="w-full space-y-6" id="me4-main-container">
      {/* Header and Stats Bento-Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="me4-stats-cards">
        <div className="md:col-span-2 bg-bg-surface-low border border-outline-variant/60 rounded-2xl p-5 flex flex-col justify-center shadow-md" id="me4-hero-card">
          <div className="space-y-1">
            <h3 className="text-xl font-display font-black text-white uppercase tracking-wider">4ª BCT-ME</h3>
          </div>
        </div>

        <div className="bg-bg-surface-low border border-outline-variant/60 rounded-2xl p-5 flex flex-col justify-between shadow-md text-center md:text-left" id="me4-stat-total">
          <span className="text-[10px] text-text-muted font-black tracking-widest uppercase font-display">Formados</span>
          <div className="mt-2 flex items-baseline gap-2 justify-center md:justify-start">
            <span className="text-3xl font-display font-black text-white">{stats.total}</span>
            <span className="text-xs text-text-muted">pessoas</span>
          </div>
        </div>

        <div className="bg-bg-surface-low border border-outline-variant/60 rounded-2xl p-5 flex flex-col justify-between shadow-md text-center md:text-left" id="me4-stat-active">
          <span className="text-[10px] text-brand-primary font-black tracking-widest uppercase font-display">Ativos</span>
          <div className="mt-2 flex items-baseline gap-2 justify-center md:justify-start">
            <span className="text-3xl font-display font-black text-white text-brand-primary">{stats.activeCount}</span>
            <span className="text-xs text-brand-primary/80">ativos</span>
          </div>
        </div>
      </div>

      {/* Main Content Card: List and Filters */}
      <div className="bg-bg-surface-low border border-outline-variant/60 rounded-3xl p-6 shadow-xl space-y-6" id="me4-table-card">
        {/* Filters and Search Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" id="me4-controls-row">
          {/* Custom Tabs */}
          <div className="flex bg-bg-surface-med p-1 rounded-xl border border-outline-variant/15 self-start" id="me4-tabs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase font-display transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-brand-primary text-black font-bold'
                  : 'text-text-muted hover:text-text-high'
              }`}
            >
              Todos ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase font-display transition-all cursor-pointer ${
                activeTab === 'active'
                  ? 'bg-brand-primary text-black font-bold'
                  : 'text-text-muted hover:text-text-high'
              }`}
            >
              Ativos ({stats.activeCount})
            </button>
            <button
              onClick={() => setActiveTab('excluded')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase font-display transition-all cursor-pointer ${
                activeTab === 'excluded'
                  ? 'bg-brand-primary text-black font-bold'
                  : 'text-text-muted hover:text-text-high'
              }`}
            >
              Excluídos ({stats.excludedCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative max-w-md w-full" id="me4-search-box">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input
              type="text"
              placeholder="Pesquisar por nome, nº ordem ou motivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-bg-surface-med border border-outline-variant/30 hover:border-outline-variant/50 focus:border-brand-primary focus:outline-none rounded-xl py-2.5 pl-10 pr-4 text-xs text-text-high font-mono placeholder:text-text-muted transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-high cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Desktop List Table View */}
        <div className={`hidden md:block overflow-x-auto border border-outline-variant/20 rounded-2xl transition-all ${theme === 'light' ? 'bg-white shadow-sm' : 'bg-zinc-950/40'}`} id="me4-table-wrapper">
          <table className="w-full text-left border-collapse" id="me4-table">
            <thead>
              <tr className={`border-b border-outline-variant/20 ${theme === 'light' ? 'bg-zinc-100/70' : 'bg-zinc-950/60'}`}>
                <th className="px-4 py-3.5 text-[9px] font-black tracking-widest text-text-muted uppercase font-display text-center w-16">C</th>
                <th className="px-4 py-3.5 text-[9px] font-black tracking-widest text-text-muted uppercase font-display w-24">Nr Ord</th>
                <th className="px-4 py-3.5 text-[9px] font-black tracking-widest text-text-muted uppercase font-display">NOME</th>
                <th className="px-4 py-3.5 text-[9px] font-black tracking-widest text-text-muted uppercase font-display text-right w-24">MÉDIA</th>
                <th className="px-4 py-3.5 text-[9px] font-black tracking-widest text-text-muted uppercase font-display text-right w-36">CLASS. ATUAL</th>
              </tr>
            </thead>
            <tbody>
              {filteredPeople.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-xs text-text-muted font-mono">
                    Nenhum resultado encontrado para os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredPeople.map((person) => {
                  const isExcluded = exclusionMap.has(person.nrOrd);
                  const reason = exclusionMap.get(person.nrOrd);
                  const rankInfo = dynamicRankings.get(person.nrOrd);
                  const newRank = rankInfo ? rankInfo.newRank : -1;
                  const upShifts = rankInfo ? rankInfo.upShifts : 0;
                  const isHighlighted = highlights.includes(person.nrOrd);

                  return (
                    <tr
                      key={person.nrOrd}
                      className={`transition-colors ${
                        isExcluded 
                          ? theme === 'light'
                            ? 'bg-zinc-100/40 hover:bg-zinc-200/50 text-text-muted/60'
                            : 'bg-zinc-900/20 hover:bg-zinc-900/30 text-text-muted/50' 
                          : isHighlighted
                            ? theme === 'light'
                              ? 'bg-purple-100/50 hover:bg-purple-100/80 text-purple-950 font-medium'
                              : 'bg-purple-950/20 hover:bg-purple-950/35 text-purple-200'
                            : theme === 'light'
                              ? 'hover:bg-zinc-100/40 text-text-high'
                              : 'hover:bg-white/[0.02] text-text-high'
                      }`}
                    >
                      {/* Original Rank (NR) */}
                      <td className="px-4 py-3 text-center text-xs font-mono font-medium border-b border-white/10">
                        <span className={
                          isExcluded 
                            ? 'line-through text-text-muted/40' 
                            : isHighlighted 
                              ? theme === 'light'
                                ? 'text-purple-700 font-bold'
                                : 'text-purple-300' 
                              : ''
                        }>
                          {person.nr}
                        </span>
                      </td>

                      {/* Nr Ord */}
                      <td className="px-4 py-3 text-xs font-mono border-b border-white/10">
                        <button
                          onClick={() => toggleHighlight(person.nrOrd)}
                          className={`font-mono text-xs cursor-pointer focus:outline-none transition-colors ${
                            isExcluded 
                              ? 'line-through text-text-muted/40 hover:text-text-muted/60' 
                              : isHighlighted
                                ? theme === 'light'
                                  ? 'text-purple-700 font-bold hover:text-purple-900'
                                  : 'text-purple-400 font-bold hover:text-purple-300'
                                : theme === 'light'
                                  ? 'text-text-muted hover:text-purple-600'
                                  : 'text-text-muted hover:text-purple-400'
                          }`}
                          title="Clique para destacar em roxo"
                        >
                          {person.nrOrd}
                        </button>
                      </td>

                      {/* Nome - Clickable to Exclude */}
                      <td className="px-4 py-3 text-xs font-sans border-b border-white/10">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleNameClick(person)}
                            className={`text-left font-semibold cursor-pointer transition-all ${
                              isExcluded 
                                ? 'line-through text-text-muted/40 hover:text-text-muted/60' 
                                : isHighlighted
                                  ? theme === 'light'
                                    ? 'text-purple-950 hover:text-purple-800 font-semibold'
                                    : 'text-purple-200 hover:text-purple-300 font-medium'
                                  : 'text-text-high hover:text-brand-primary'
                            }`}
                            title={isExcluded ? "Clique para editar ou remover exclusão" : "Clique para excluir da classificação"}
                          >
                            {person.nome}
                          </button>
                          
                          {/* Exclusions Reason inside parenthesis */}
                          {isExcluded && reason && (
                            <span className="text-[10px] text-amber-500/80 font-mono italic">
                              ({reason})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Média */}
                      <td className="px-4 py-3 text-right text-xs font-mono border-b border-white/10">
                        <span className={
                          isExcluded 
                            ? 'line-through text-text-muted/40' 
                            : isHighlighted 
                              ? theme === 'light'
                                ? 'text-purple-700 font-bold'
                                : 'text-purple-300 font-semibold' 
                              : 'text-text-high'
                        }>
                          {person.media}
                        </span>
                      </td>

                      {/* Nova Classificação and Up Shifts Badge */}
                      <td className="px-4 py-3 text-right text-xs font-mono font-medium border-b border-white/10">
                        {isExcluded ? (
                          <span className="text-[10px] text-text-muted/30 uppercase tracking-widest italic">Excluído</span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <span className={`font-bold ${
                              isHighlighted 
                                ? theme === 'light'
                                  ? 'text-purple-700 font-bold'
                                  : 'text-purple-300' 
                                : theme === 'light'
                                  ? 'text-text-high'
                                  : 'text-white'
                            }`}>{newRank}º</span>
                            {upShifts > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                <ChevronUp size={10} className="stroke-[3px]" />
                                +{upShifts}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile List View (No horizontal scroll) */}
        <div className="block md:hidden space-y-3" id="me4-mobile-list">
          {filteredPeople.length === 0 ? (
            <div className="text-center py-12 text-xs text-text-muted font-mono bg-bg-surface-low rounded-2xl border border-outline-variant/20">
              Nenhum resultado encontrado para os filtros atuais.
            </div>
          ) : (
            <div className={`border border-outline-variant/20 rounded-2xl overflow-hidden ${theme === 'light' ? 'bg-white shadow-sm' : 'bg-zinc-950/40'}`}>
              {filteredPeople.map((person) => {
                const isExcluded = exclusionMap.has(person.nrOrd);
                const reason = exclusionMap.get(person.nrOrd);
                const rankInfo = dynamicRankings.get(person.nrOrd);
                const newRank = rankInfo ? rankInfo.newRank : -1;
                const upShifts = rankInfo ? rankInfo.upShifts : 0;
                const isHighlighted = highlights.includes(person.nrOrd);

                return (
                  <div
                    key={person.nrOrd}
                    className={`p-4 flex flex-col gap-3 transition-colors border-b border-white/10 last:border-b-0 ${
                      isExcluded
                        ? theme === 'light'
                          ? 'bg-zinc-100/40 text-text-muted/60'
                          : 'bg-zinc-900/20 text-text-muted/50'
                        : isHighlighted
                          ? theme === 'light'
                            ? 'bg-purple-100/50 text-purple-950 font-medium'
                            : 'bg-purple-950/20 text-purple-200'
                          : theme === 'light'
                            ? 'bg-white hover:bg-zinc-100/20 text-text-high'
                            : 'bg-transparent hover:bg-white/[0.01] text-text-high'
                    }`}
                  >
                    {/* Top Row: Ranks and Media */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isExcluded ? (
                          <span className="text-[10px] font-black uppercase tracking-wider text-text-muted/50 bg-bg-surface-high border border-white/10 px-2 py-0.5 rounded">
                            Excluído
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-black font-display ${isHighlighted ? 'text-purple-400' : 'text-white'}`}>
                              {newRank}º
                            </span>
                            {upShifts > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/20">
                                <ChevronUp size={8} className="stroke-[3px]" />
                                {upShifts}
                              </span>
                            )}
                          </div>
                        )}
                        <span className="text-[10px] font-mono text-text-muted">
                          Original: #{person.nr}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className={`text-xs font-mono font-bold ${isExcluded ? 'line-through text-text-muted/40' : 'text-white'}`}>
                          {person.media}
                        </span>
                      </div>
                    </div>

                    {/* Middle Area: Name & Actions */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          onClick={() => handleNameClick(person)}
                          className={`text-left text-xs font-bold cursor-pointer transition-all ${
                            isExcluded
                              ? 'line-through text-text-muted/40'
                              : isHighlighted
                                ? theme === 'light'
                                  ? 'text-purple-950 hover:text-purple-800'
                                  : 'text-purple-200 hover:text-purple-300'
                                : 'text-text-high hover:text-brand-primary'
                          }`}
                        >
                          {person.nome}
                        </button>
                        {isExcluded && reason && (
                          <span className="text-[10px] text-amber-500/80 font-mono italic">
                            ({reason})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        <span className="text-text-muted">Ordem:</span>
                        <button
                          onClick={() => toggleHighlight(person.nrOrd)}
                          className={`cursor-pointer hover:underline ${
                            isExcluded
                              ? 'line-through text-text-muted/40'
                              : isHighlighted
                                ? 'text-purple-400 font-bold'
                                : 'text-text-muted hover:text-purple-400'
                          }`}
                        >
                          {person.nrOrd}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Exclusion Reason Modal dialog */}
      <AnimatePresence>
        {selectedPerson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="modal-me4-exclusion">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedPerson(null)}
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className={`relative w-full max-w-md border rounded-3xl p-6 shadow-2xl space-y-6 overflow-hidden ${
                theme === 'light'
                  ? 'bg-white border-zinc-200 text-zinc-900 shadow-xl'
                  : 'bg-bg-surface border-outline-variant/50 text-white'
              }`}
            >
              <div className="flex items-center justify-between" id="modal-me4-header">
                <div className="space-y-1">
                  <span className="text-[9px] text-brand-primary font-black tracking-widest uppercase font-display">Opções de Exclusão Justificada</span>
                  <h4 className={`text-base font-display font-black uppercase ${
                    theme === 'light' ? 'text-zinc-900' : 'text-white'
                  }`}>{selectedPerson.nome}</h4>
                </div>
                <button
                  onClick={() => setSelectedPerson(null)}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    theme === 'light' ? 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900' : 'hover:bg-white/10 text-text-muted hover:text-white'
                  }`}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Informative Row */}
              <div className={`p-3.5 rounded-xl border grid grid-cols-3 gap-2 text-center text-xs font-mono ${
                theme === 'light'
                  ? 'bg-zinc-100/80 border-zinc-200 text-zinc-900'
                  : 'bg-zinc-950/60 border-outline-variant/10 text-white'
              }`}>
                <div>
                  <span className={`block text-[8px] uppercase tracking-wider mb-1 font-bold ${
                    theme === 'light' ? 'text-zinc-500' : 'text-text-muted'
                  }`}>NR (Original)</span>
                  <strong className={`text-sm ${
                    theme === 'light' ? 'text-zinc-900' : 'text-white'
                  }`}>{selectedPerson.nr}º</strong>
                </div>
                <div>
                  <span className={`block text-[8px] uppercase tracking-wider mb-1 font-bold ${
                    theme === 'light' ? 'text-zinc-500' : 'text-text-muted'
                  }`}>Nr Ord</span>
                  <strong className={`text-sm ${
                    theme === 'light' ? 'text-zinc-900' : 'text-white'
                  }`}>{selectedPerson.nrOrd}</strong>
                </div>
                <div>
                  <span className={`block text-[8px] uppercase tracking-wider mb-1 font-bold ${
                    theme === 'light' ? 'text-zinc-500' : 'text-text-muted'
                  }`}>Média</span>
                  <strong className={`text-sm ${
                    theme === 'light' ? 'text-zinc-900' : 'text-white'
                  }`}>{selectedPerson.media}</strong>
                </div>
              </div>

              {/* Exclusion Input Form */}
              <form onSubmit={handleExclusionSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="exclusion-reason" className={`block text-[10px] font-black tracking-widest uppercase font-display ${
                    theme === 'light' ? 'text-zinc-600' : 'text-text-muted'
                  }`}>
                    Motivo de Exclusão
                  </label>
                  <textarea
                    id="exclusion-reason"
                    rows={3}
                    placeholder="Ex: Baixa, Expulsão, Outros..."
                    value={reasonInput}
                    onChange={(e) => setReasonInput(e.target.value)}
                    className={`w-full border rounded-xl p-3 text-xs font-sans transition-all resize-none focus:outline-none focus:border-brand-primary ${
                      theme === 'light'
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:bg-white'
                        : 'bg-zinc-950 border-outline-variant/40 hover:border-outline-variant/60 text-text-high placeholder:text-text-muted'
                    }`}
                    required
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2" id="modal-me4-actions">
                  {exclusionMap.has(selectedPerson.nrOrd) && (
                    <button
                      type="button"
                      onClick={() => {
                        handleRemoveExclusion(selectedPerson.nrOrd);
                        setSelectedPerson(null);
                      }}
                      className="mr-auto px-3.5 py-2 rounded-xl text-[10px] font-black tracking-widest text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 uppercase font-display transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <UserCheck size={12} />
                      Restaurar
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedPerson(null)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase font-display transition-all cursor-pointer border ${
                      theme === 'light'
                        ? 'text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 border-zinc-200'
                        : 'text-text-muted hover:text-text-high bg-transparent border-outline-variant/30 hover:bg-white/5'
                    }`}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-[10px] font-black tracking-widest text-black bg-brand-primary hover:bg-brand-primary/90 hover:scale-[1.02] uppercase font-display transition-all font-bold cursor-pointer flex items-center gap-1.5"
                  >
                    <Check size={12} className="stroke-[3px]" />
                    Confirmar Exclusão
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
