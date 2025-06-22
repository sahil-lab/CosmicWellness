import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import YouTube from 'react-youtube';
import { VideoRecommendation } from '../types';
import { Play, Clock, Tag } from 'lucide-react';

interface VideoPlayerProps {
  videos: VideoRecommendation[];
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videos }) => {
  const [activeVideo, setActiveVideo] = useState<string | null>(videos.length > 0 ? videos[0].id : null);

  useEffect(() => {
    if (videos.length > 0) {
      setActiveVideo(videos[0].id);
    }
  }, [videos]);

  const opts = {
    height: '315',
    width: '560',
    playerVars: {
      autoplay: 0,
      modestbranding: 1,
      rel: 0,
    },
  };

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse-slow">
          <div className="w-16 h-16 bg-mystical-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Play className="w-8 h-8 text-white" />
          </div>
        </div>
        <p className="text-cosmic-300">No recommendations available right now. Please try again later or adjust your input.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-white mb-4">
          Your Personalized Healing Journey
        </h2>
        <p className="text-cosmic-200 text-lg">
          AI-curated videos to transform your energy and elevate your consciousness
        </p>
      </motion.div>

      <div className="grid gap-6">
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-1/2">
                <div className="aspect-video rounded-lg overflow-hidden bg-cosmic-900">
                  {activeVideo === video.id && video.videoId ? (
                    <YouTube
                      videoId={video.videoId}
                      opts={opts}
                      className="w-full h-full"
                    />
                  ) : (
                    <div
                      className="w-full h-full bg-cover bg-center relative cursor-pointer group"
                      style={{ backgroundImage: `url(${video.thumbnail})` }}
                      onClick={() => setActiveVideo(video.id)}
                    >
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="bg-mystical-500 rounded-full p-4"
                        >
                          <Play className="w-8 h-8 text-white" />
                        </motion.div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:w-1/2 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {video.title}
                  </h3>
                  <a
                    href={`https://www.youtube.com/watch?v=${video.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline text-sm mb-2 inline-block"
                  >
                    Watch on YouTube
                  </a>
                  <p className="text-cosmic-200 leading-relaxed">
                    {video.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 bg-mystical-500/20 px-3 py-1 rounded-full">
                    <Tag className="w-4 h-4 text-mystical-400" />
                    <span className="text-mystical-400 text-sm capitalize">
                      {video.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-golden-500/20 px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4 text-golden-400" />
                    <span className="text-golden-400 text-sm">
                      {video.duration}
                    </span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveVideo(video.id)}
                  className="w-full bg-gradient-to-r from-mystical-500 to-mystical-600 hover:from-mystical-600 hover:to-mystical-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                >
                  {activeVideo === video.id ? 'Playing Now' : 'Start Healing'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};