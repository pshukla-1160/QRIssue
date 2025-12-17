import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import {
    Camera,
    useCameraDevice,
    useCodeScanner,
    Code,
    CodeScannerFrame,
} from 'react-native-vision-camera';
import type { LayoutChangeEvent } from 'react-native';

interface CameraHighlight {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface HighlightBoxProps {
    highlight: CameraHighlight;
    layout: LayoutChangeEvent['nativeEvent']['layout'];
    scanFrame: CodeScannerFrame;
}

const HighlightBox: React.FC<HighlightBoxProps> = ({ highlight, layout, scanFrame }) => {
    const isLandscapeFrame = scanFrame.width > scanFrame.height;
    
    const frameWidth = isLandscapeFrame ? scanFrame.width : scanFrame.height;
    const frameHeight = isLandscapeFrame ? scanFrame.height : scanFrame.width;

    const scaleX = layout.width / frameHeight; 
    const scaleY = layout.height / frameWidth;

    return (
        <View
            style={[
                styles.highlightBox,
                {
                    left: highlight.x * scaleX,
                    top: highlight.y * scaleY,
                    width: highlight.width * scaleX,
                    height: highlight.height * scaleY,
                },
            ]}
        />
    );
};



const NoCameraDeviceError = () => (
    <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No camera device found</Text>
    </View>
);

function QRScanner() {
    const [scanFrame, setScanFrame] = useState<CodeScannerFrame>({ height: 1, width: 1 });
    const [codeScannerHighlights, setCodeScannerHighlights] = useState<CameraHighlight[]>([]);
    const [layout, setLayout] = useState<LayoutChangeEvent['nativeEvent']['layout']>({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });
    const device = useCameraDevice('back');
const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'code-128'],
    onCodeScanned: (codes: Code[], frame: CodeScannerFrame) => {
        setScanFrame(frame);
        
        const highlights = codes.map(code => {
            const { x, y, width, height } = code.frame;
            return {
                x: frame.height - y - height, 
                y: x,
                width: height,
                height: width,
            };
        });

        setCodeScannerHighlights(highlights);
    },
});


    const onLayout = (evt: LayoutChangeEvent) => {
        if (evt.nativeEvent.layout) {
            console.log('Camera Layout:', evt.nativeEvent.layout);
            setLayout(evt.nativeEvent.layout);
        }
    };

    if (device == null) return <NoCameraDeviceError />;
    console.log('QRScanner Render:', {
        highlightsCount: codeScannerHighlights.length,
        layout,
        scanFrame,
        device: device ? 'found' : 'not found'
    });

    return (
        <>
            <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                onLayout={onLayout}
                codeScanner={codeScanner}
            />
            {codeScannerHighlights.map((highlight, key) => (
                <HighlightBox key={key} highlight={highlight} layout={layout} scanFrame={scanFrame} />
            ))}
        </>
    );

}

const styles = StyleSheet.create({
    highlightBox: {
        position: 'absolute',
        borderWidth: 2,
        borderColor: '#00FF00',
        borderRadius: 8,
        backgroundColor: 'rgba(0, 255, 0, 0.2)',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    errorText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default QRScanner;
