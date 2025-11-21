from youtube_transcript_api import YouTubeTranscriptApi


video_id = "4IoqMYRosBE"
yt = YouTubeTranscriptApi() 
transcript_list = yt.list(video_id)
t = yt.fetch(video_id)
print(t)
print(transcript_list)

# target_transcript = transcript_list.find_manually_created_transcript(['en', 'en-US', 'en-GB'])
# target_transcript1 = transcript_list.find_generated_transcript(['en', 'en-US', 'en-GB'])
# print(target_transcript)
# print(target_transcript1)
# final_data = target_transcript.fetch()
# print(final_data)

# data = YouTubeTranscriptApi.g("4IoqMYRosBE", languages=['en'])
# print(data)