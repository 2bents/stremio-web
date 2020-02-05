const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const Icon = require('stremio-icons/dom');
const Button = require('stremio/common/Button');
const Image = require('stremio/common/Image');
const Multiselect = require('stremio/common/Multiselect');
const PlayIconCircleCentered = require('stremio/common/PlayIconCircleCentered');
const useBinaryState = require('stremio/common/useBinaryState');
const styles = require('./styles');

const ICON_FOR_TYPE = new Map([
    ['movie', 'ic_movies'],
    ['series', 'ic_series'],
    ['channel', 'ic_channels'],
    ['tv', 'ic_tv'],
    ['other', 'ic_movies']
]);

const MetaItem = React.memo(({ className, type, name, poster, posterShape, playIcon, progress, options, dataset, optionOnSelect, ...props }) => {
    const [menuOpen, onMenuOpen, onMenuClose] = useBinaryState(false);
    const metaItemOnClick = React.useCallback((event) => {
        if (typeof props.onClick === 'function') {
            props.onClick(event);
        }

        if (event.nativeEvent.selectPrevented) {
            event.preventDefault();
        }
    }, [props.onClick]);
    const menuOnClick = React.useCallback((event) => {
        event.nativeEvent.selectPrevented = true;
    }, []);
    const menuOnSelect = React.useCallback((event) => {
        if (typeof optionOnSelect === 'function') {
            optionOnSelect({
                type: 'select-option',
                value: event.value,
                dataset: dataset,
                reactEvent: event.reactEvent,
                nativeEvent: event.nativeEvent
            });
        }
    }, [dataset, optionOnSelect]);
    const renderPosterFallback = React.useMemo(() => () => (
        <Icon
            className={styles['placeholder-icon']}
            icon={ICON_FOR_TYPE.has(type) ? ICON_FOR_TYPE.get(type) : ICON_FOR_TYPE.get('other')}
        />
    ), [type]);
    const renderMenuLabelContent = React.useMemo(() => () => (
        <Icon className={styles['icon']} icon={'ic_more'} />
    ), []);
    return (
        <Button title={name} {...props} className={classnames(className, styles['meta-item-container'], styles['poster-shape-poster'], styles[`poster-shape-${posterShape}`], { 'active': menuOpen })} onClick={metaItemOnClick}>
            <div className={styles['poster-container']}>
                <div className={styles['poster-image-layer']}>
                    <Image
                        className={styles['poster-image']}
                        src={poster}
                        alt={' '}
                        renderFallback={renderPosterFallback}
                    />
                </div>
                {
                    playIcon ?
                        <div className={styles['play-icon-layer']}>
                            <PlayIconCircleCentered className={styles['play-icon']} />
                        </div>
                        :
                        null
                }
                {
                    progress > 0 ?
                        <div className={styles['progress-bar-layer']}>
                            <div className={styles['progress-bar']} style={{ width: `${Math.min(progress, 1) * 100}%` }} />
                        </div>
                        :
                        null
                }
            </div>
            {
                (typeof name === 'string' && name.length > 0) || (Array.isArray(options) && options.length > 0) ?
                    <div className={styles['title-bar-container']}>
                        {
                            typeof name === 'string' && name.length > 0 ?
                                <div className={styles['title-label']}>{name}</div>
                                :
                                null
                        }
                        {
                            Array.isArray(options) && options.length > 0 ?
                                <Multiselect
                                    className={styles['menu-label-container']}
                                    renderLabelContent={renderMenuLabelContent}
                                    options={options}
                                    onOpen={onMenuOpen}
                                    onClose={onMenuClose}
                                    onSelect={menuOnSelect}
                                    onClick={menuOnClick}
                                />
                                :
                                null
                        }
                    </div>
                    :
                    null
            }
        </Button>
    );
});

MetaItem.displayName = 'MetaItem';

MetaItem.propTypes = {
    className: PropTypes.string,
    type: PropTypes.string,
    name: PropTypes.string,
    poster: PropTypes.string,
    posterShape: PropTypes.oneOf(['poster', 'landscape', 'square']),
    playIcon: PropTypes.bool,
    progress: PropTypes.number,
    options: PropTypes.array,
    dataset: PropTypes.object,
    optionOnSelect: PropTypes.func,
    onClick: PropTypes.func
};

module.exports = MetaItem;
