"use client";

import type { PlaceType } from "@/types/places";

type Props = {
    locationText: string;
    onLocationTextChange: (v: string) => void;

    keyword: string;
    onKeywordChange: (v: string) => void;

    type: PlaceType;
    onTypeChange: (v: PlaceType) => void;

    minRating: number;
    onMinRatingChange: (v: number) => void;

    radiusKm: number;
    onRadiusKmChange: (v: number) => void;

    onSearch: () => void;
};

export default function FiltersPanel({
                                         locationText,
                                         onLocationTextChange,
                                         keyword,
                                         onKeywordChange,
                                         type,
                                         onTypeChange,
                                         minRating,
                                         onMinRatingChange,
                                         radiusKm,
                                         onRadiusKmChange,
                                         onSearch,
                                     }: Props) {
    return (
        <aside className="panel">
            <div className="field">
                <label className="label">Location</label>
                <input
                    className="input"
                    value={locationText}
                    onChange={(e) => onLocationTextChange(e.target.value)}
                    placeholder="e.g. London"
                />
            </div>

            <div className="field">
                <label className="label">Hashtags / Keyword</label>
                <input
                    className="input"
                    value={keyword}
                    onChange={(e) => onKeywordChange(e.target.value)}
                    placeholder="e.g. #Cafe, brunch, study"
                />
            </div>

            <div className="field">
                <label className="label">Type</label>
                <select className="select" value={type} onChange={(e) => onTypeChange(e.target.value as PlaceType)}>
                    <option value="cafe">Cafe</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="bar">Bar</option>
                    <option value="park">Park</option>
                    <option value="tourist_attraction">Tourist attraction</option>
                </select>
            </div>

            <div className="field">
                <label className="label">Radius: {radiusKm.toFixed(1)} km</label>
                <input
                    className="range"
                    type="range"
                    min={0.5}
                    max={10}
                    step={0.5}
                    value={radiusKm}
                    onChange={(e) => onRadiusKmChange(Number(e.target.value))}
                />
            </div>

            <div className="field">
                <label className="label">Rating: {minRating.toFixed(1)}+</label>
                <input
                    className="range"
                    type="range"
                    min={0}
                    max={5}
                    step={0.1}
                    value={minRating}
                    onChange={(e) => onMinRatingChange(Number(e.target.value))}
                />
            </div>

            <button className="button" onClick={onSearch}>
                Search
            </button>

            <style jsx>{`
        .panel {
          background: #fff;
          border: 2px solid #2b83ff;
          border-radius: 14px;
          padding: 18px;
          height: 100%;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }
        .field { margin-bottom: 14px; }
        .label { display: block; font-size: 14px; margin-bottom: 6px; color: #111; }
        .input, .select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 10px;
          outline: none;
        }
        .range { width: 100%; }
        .button {
          width: 100%;
          padding: 11px 12px;
          border: none;
          border-radius: 10px;
          background: #2b83ff;
          color: #fff;
          font-weight: 600;
          cursor: pointer;
        }
        .button:hover { background: #1f6fe0; }
      `}</style>
        </aside>
    );
}
