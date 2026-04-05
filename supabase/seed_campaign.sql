-- DAY 1: The Awakening
INSERT INTO daily_missions (id, active_date, title, fragment_name, briefing_dialogue, success_dialogue, failure_dialogue)
VALUES (
  gen_random_uuid(),
  CURRENT_DATE,
  'The Awakening',
  'The Nexus Core',
  ARRAY[
    'Sentinel, wake up. The grid is compromised.',
    'The Time-Eaters—Chronos-Aliens—have breached our timeline. They are feeding on our past.',
    'We have the blueprints for the ''Aegis Weapon'' to wipe them out, but the pieces are scattered across the Time-Mazes.',
    'Your first target is the Nexus Core. Get in, grab it, and do not let them touch you. Go.'
  ],
  ARRAY['Core secured. Excellent work, Sentinel. We are one step closer to taking our land back.'],
  ARRAY['Sentinel is down! They stripped the timeline. We have to try again tomorrow.']
);

-- DAY 2: The Blockade
INSERT INTO daily_missions (id, active_date, title, fragment_name, briefing_dialogue, success_dialogue, failure_dialogue)
VALUES (
  gen_random_uuid(),
  CURRENT_DATE + 1,
  'The Blockade',
  'The Plasma Emitter',
  ARRAY[
    'The Chronos-Aliens noticed you yesterday. They are swarming Sector 4.',
    'We are dropping deployable Energy Shields into your inventory. Use them to block the narrow corridors.',
    'Your target is the Plasma Emitter. Drop the shields to stall them, grab the piece, and extract.'
  ],
  ARRAY['Plasma Emitter acquired. The weapon is taking shape on the dashboard.'],
  ARRAY['The shields didn''t hold! Command, we lost the package. We''ll reset the grid for tomorrow.']
);

-- DAY 3: Offensive Measures
INSERT INTO daily_missions (id, active_date, title, fragment_name, briefing_dialogue, success_dialogue, failure_dialogue)
VALUES (
  gen_random_uuid(),
  CURRENT_DATE + 2,
  'Offensive Measures',
  'The Targeting Lens',
  ARRAY[
    'Shields aren''t going to be enough anymore. They are adapting.',
    'I''ve authorized the deployment of automated Turrets. Place them strategically; they will fire automatically when the beasts get close.',
    'The Targeting Lens is at the center of the labyrinth. Secure it.'
  ],
  ARRAY['Lens secured. Good placement on those turrets. We almost have a functional prototype.'],
  ARRAY['Overrun! They moved too fast. Recalibrate your defenses for the next attempt.']
);

-- DAY 4: The Dead Zone
INSERT INTO daily_missions (id, active_date, title, fragment_name, briefing_dialogue, success_dialogue, failure_dialogue)
VALUES (
  gen_random_uuid(),
  CURRENT_DATE + 3,
  'The Dead Zone',
  'The Chrono-Battery',
  ARRAY[
    'This sector has been completely drained by the Time-Eaters. It''s a dead zone.',
    'Visibility is low, and their numbers have doubled.',
    'You need the Chrono-Battery to power the Aegis Weapon. If you fail today, we lose massive ground. Stay sharp.'
  ],
  ARRAY['Battery is slotted in. The weapon is pulsing. Just one piece left for this phase.'],
  ARRAY['We lost the signal! Sentinel, pull back! We have to wait for the storm to clear tomorrow.']
);

-- DAY 5: The First Assembly
INSERT INTO daily_missions (id, active_date, title, fragment_name, briefing_dialogue, success_dialogue, failure_dialogue)
VALUES (
  gen_random_uuid(),
  CURRENT_DATE + 4,
  'The First Assembly',
  'The Trigger Mechanism',
  ARRAY[
    'This is it, Sentinel. The final piece for Phase 1: The Trigger Mechanism.',
    'They know what you are trying to do. They are throwing everything at this maze.',
    'Use every shield and turret you have. Get that trigger, and we can finally push them back.'
  ],
  ARRAY['TRIGGER SECURED! The Aegis Weapon Phase 1 is fully assembled. Incredible work, Architect. Prepare for the next phase.'],
  ARRAY['They reached the trigger before us! Damn it! Hold the line, we try again in 24 hours.']
);
