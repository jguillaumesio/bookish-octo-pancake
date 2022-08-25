import * as React from 'react';
import {Button, Typography, Box, Stepper, StepLabel, Step} from '@mui/material';
import {useState, useRef, useCallback, useEffect} from "react";
import {buttons} from "../utils/pad";
import {useNavigate} from "react-router-dom";
import {KeyContext} from "../provider/HotKeyProvider";

export const ModalStepper = (props) => {
    const { seasons, setCurrentEpisode } = props;
    const [selectedSeason, setSelectedSeason] = useState(0);
    const [selectedEpisode, setSelectedEpisode] = useState(0);
    const [selectedPlayer, setSelectedPlayer] = useState(0);
    const [activeStep, setActiveStep] = useState(0);
    const navigate = useNavigate();
    const [setKeys] = React.useContext(KeyContext);
    const listRef = useRef();
    const elementHeight = 40;

    useEffect(() => {
        setKeys(keyEvents);
    },[activeStep, selectedSeason, selectedEpisode]);

    const visibleFromList = useCallback((list, offset) => {
        const nbrOfElements = (listRef?.current?.offsetHeight ?? 0) / elementHeight;
        if(nbrOfElements === 0){
            return [];
        }
        if(list.length <= nbrOfElements){
            return list;
        }
        return (offset + nbrOfElements > list.length)
            ? [...list.slice(offset, nbrOfElements), ...list.slice(0, offset + nbrOfElements - list.length)]
            : list.slice(offset, offset + nbrOfElements);
    },[listRef.current]);

    const steps = () => [
        {label: 'Sélection de la saison', onBack: () => navigate("/movies"), onValidate: ({move}) => handleState(move), setter: setSelectedSeason, selected: selectedSeason, list: seasons.map((e,i) => `Saison ${i+1}`)},
        {label: 'Sélection de l\'épisode', onBack: ({move}) => handleState(move), onValidate: ({move}) => handleState(move), setter: setSelectedEpisode, selected: selectedEpisode, list: seasons[selectedSeason].map((e,i) => `Épisode ${i+1}`)},
        {label: 'Sélection du player', onBack: ({move}) => handleState(move), onValidate: ({seasonIndex, episodeIndex, player}) => setCurrentEpisode(seasonIndex, episodeIndex, player), setter: setSelectedPlayer, selected: selectedPlayer, list: seasons[selectedSeason][selectedEpisode].map(e => `${e.version.toUpperCase()} ${e.player}`)},
    ];

    const handleState = (move) => setActiveStep(prevActiveStep => prevActiveStep + move);

    const handleIndexSelection = ({setter, length, move}) => {
        const shift = (move === "down") ? 1 : -1;
        const modulo = (n, m) => ((n % m) + m) % m;
        setter(index => {
            return modulo(index + shift, length);
        });
    }

    const keyEvents = [
        {
            ...buttons.bottom,
            display: false,
            continuous: true,
            label:"Se déplacer",
            args: {"move": "down", "setter": steps()[activeStep].setter, "length": steps()[activeStep].list.length},
            callback: handleIndexSelection
        },
        {
            ...buttons.top,
            display: false,
            continuous: true,
            label:"Se déplacer",
            args: {"move": "top", "setter": steps()[activeStep].setter, "length": steps()[activeStep].list.length},
            callback: handleIndexSelection
        },
        {
            ...buttons.cross,
            label: "Valider",
            args: {move: 1, seasonIndex: selectedSeason, episodeIndex: selectedEpisode, player: seasons[selectedSeason][selectedEpisode][selectedPlayer] },
            callback: steps()[activeStep].onValidate
        },
        {
            ...buttons.circle,
            label: "Retour",
            args:{move: -1},
            callback: steps()[activeStep].onBack
        },
    ]

    return (
        (activeStep !== undefined) &&
            <Box sx={{ width: '100%', height:"100%", margin:"10px 0", display:"flex", flexDirection:"column"}}>
                <Stepper activeStep={activeStep}>
                    {steps().map((step, index) => {
                        const stepProps = {};
                        const labelProps = {};
                        return (
                            <Step key={index} {...stepProps}>
                                <StepLabel {...labelProps}>{step.label}</StepLabel>
                            </Step>
                        );
                    })}
                </Stepper>
                {activeStep === steps().length ? (
                    <React.Fragment>
                        <Typography sx={{ mt: 2, mb: 1 }}>
                            All steps completed - you&apos;re finished
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                            <Box sx={{ flex: '1 1 auto' }} />
                            <Button onClick={() => null}>Reset</Button>
                        </Box>
                    </React.Fragment>
                ) : (
                    <React.Fragment>
                        <ul ref={listRef} style={{ listStyleType:"none", margin:"10px 0", flex:1, overflow:"hidden"}}>
                            {visibleFromList(steps()[activeStep].list, steps()[activeStep].selected).map((e,index) => {
                                return <li key={index} style={{ padding:"10px", background: `${index !== steps()[activeStep].selected ? "white" : "grey"}`}}>{e}</li>
                            })}
                        </ul>
                        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 0 }}>
                            <Button
                                color="inherit"
                                disabled={activeStep === 0}
                                onClick={() => handleState({move: -1})}
                                sx={{ mr: 1 }}
                            >
                                Back
                            </Button>
                            <Box sx={{ flex: '1 1 auto' }} />

                            <Button onClick={() => handleState({move: 1})}>
                                {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                            </Button>
                        </Box>
                    </React.Fragment>
                )}
            </Box>
        );
}
